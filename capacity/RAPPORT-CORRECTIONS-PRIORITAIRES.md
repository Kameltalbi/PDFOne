# One2PDF — rapport des corrections prioritaires

Date : 5 septembre 2026. Périmètre : code applicatif du dépôt local. L’audit du VPS est reporté.

**La priorité est de fiabiliser les résultats et de borner les ressources consommées par les traitements.** Le code présente des défauts fonctionnels précis et des protections insuffisantes contre l’accumulation de travail. Ces constats justifient des corrections, mais ne permettent pas encore de chiffrer la capacité réelle du service.

Aucune correction applicative n’a été effectuée. Aucun test de charge en production n’a été lancé. Les constats ci-dessous distinguent le comportement établi par lecture du code de ses conséquences possibles, encore non mesurées en production.

**Ordre de priorité proposé**

P0 : défauts de fiabilité à traiter rapidement ou protections nécessaires avant une augmentation significative du trafic. P1 : améliorations importantes pour les performances et l’exploitation. P2 : évolutions à décider après les mesures de capacité.

| Priorité | Point à corriger | Conséquence principale |
|---|---|---|
| P0 | Compression « high » exécutée comme « medium » | Traitement différent de celui prévu, rasterisation inutile |
| P0 | Résultat OCR potentiellement incomplet sans erreur | Des pages peuvent manquer dans un résultat annoncé réussi |
| P0 | Limites d’envoi appliquées trop tard | Consommation de disque avant le rejet du fichier |
| P0 | Travail simultané et files d’attente non bornés | Accumulation des demandes et ralentissement général |
| P0 | Nettoyage incomplet et suppression fondée uniquement sur l’âge | Fichiers oubliés ou suppression d’une entrée encore utilisée |
| P0 avant plusieurs instances | Persistance JSON non transactionnelle | Compteurs incohérents, écrasements possibles de données |
| P1 | Conservation des images de toutes les pages en mémoire | Forte consommation de RAM sur les documents longs |
| P1 | Libération des ressources PDF.js à corriger | Nettoyage final incompatible avec la version installée |
| P1 | Calculs lourds dans le processus API | Risque de dégradation de la réactivité de l’ensemble du service |
| P1 | Quotas et limitation de débit à dissocier | Refus mal expliqués et protection insuffisante contre les rafales |
| P1 | Mesures techniques et documentation incomplètes | Diagnostic difficile et décisions de dimensionnement peu fiables |

**1. Corriger le mode de compression « high » — P0**

Constat confirmé : le réglage `high` vaut `null`, ce qui devrait sélectionner la branche de copie/optimisation du PDF. Mais l’expression `QUALITY_PRESETS[quality] ?? QUALITY_PRESETS.medium` remplace ce `null` par le réglage `medium`. La branche prévue pour `high` n’est donc jamais atteinte avec les valeurs définies.

Impact : un PDF demandé dans ce mode est transformé en images. Cela impose du calcul supplémentaire et peut faire perdre le texte sélectionnable et les propriétés vectorielles du document. L’importance du coût supplémentaire reste à mesurer.

Correction proposée : distinguer une option inconnue du `null` volontaire, puis définir clairement les garanties de chaque mode. Vérifier aussi la conservation des dimensions physiques des pages dans les branches raster, qui reconstruisent actuellement les pages à partir des dimensions des images.

Validation attendue : sur un PDF texte synthétique, `high` conserve le texte extractible et les dimensions des pages ; les trois réglages exécutent bien leurs comportements respectifs.

Source : [compress.ts](../server/src/services/compress.ts), notamment lignes 9–12 et 27–46.

**2. Empêcher l’OCR de renvoyer silencieusement un PDF incomplet — P0**

Constat confirmé : l’échec de la commande Tesseract qui produit le PDF d’une page est ignoré. Si ce fichier n’existe pas, la page n’est pas ajoutée au résultat. Le service renvoie néanmoins un PDF dès qu’au moins une page a été produite.

Impact possible : sur un document de plusieurs pages, une défaillance partielle peut produire un PDF auquel il manque des pages sans signaler l’échec à l’utilisateur. Aucun incident client de ce type n’a été observé pendant cet audit.

Correction proposée : ne jamais considérer un résultat partiel comme une réussite complète. Soit conserver toutes les pages, avec un statut explicite pour celles non reconnues, soit échouer clairement et supprimer le résultat incomplet. Un éventuel repli vers du texte doit aussi être annoncé explicitement.

Validation attendue : simuler localement l’échec OCR d’une page d’un document synthétique ; vérifier qu’aucun PDF incomplet n’est annoncé comme une conversion réussie.

Source : [ocr.ts](../server/src/services/ocr.ts), lignes 139–154.

**3. Appliquer les limites pendant la réception des fichiers — P0**

Constat confirmé : l’envoi gratuit est limité à 20 Mio, mais la vérification intervient après l’écriture du fichier. La limite initiale de Multer est au minimum de 1 Gio ; la formule actuelle empêche un réglage inférieur de réduire ce plafond. Il n’existe pas de budget total explicite en octets pour une requête contenant plusieurs fichiers.

Impact possible : un fichier finalement refusé peut déjà avoir mobilisé le disque, la bande passante et les connexions du serveur. Plusieurs envois simultanés amplifient ce coût.

Correction proposée : déterminer le droit d’accès avant l’envoi, appliquer le plafond correspondant pendant la réception, respecter un plafond technique configurable et ajouter une limite cumulée par requête. Prévoir une admission tenant compte de l’espace temporaire disponible et nettoyer les fichiers partiels en cas d’interruption.

Validation attendue : un fichier trop volumineux est interrompu près du plafond autorisé ; un lot dépassant le budget total est rejeté ; aucun fichier partiel ne reste après le refus.

Sources : [upload.ts](../server/src/middleware/upload.ts) et [limits.ts](../server/src/utils/limits.ts).

**4. Borner la concurrence, l’attente et la durée totale — P0**

Constat confirmé : les traitements PDF classiques n’ont pas de limite générale de concurrence. LibreOffice et OCR disposent chacun d’une file en mémoire, avec un traitement actif par processus Node, mais sans limite de demandes en attente. BullMQ et Redis ne sont pas utilisés par le code inspecté.

Les délais natifs ne constituent pas une limite globale : LibreOffice peut faire plusieurs tentatives de 180 secondes ; l’OCR applique ses délais commande par commande et page par page. L’attente préalable peut encore s’ajouter.

Impact possible : davantage d’utilisateurs peuvent surtout créer davantage d’attente, de fichiers temporaires et de requêtes ouvertes. Un client qui abandonne peut laisser un travail continuer côté serveur.

Correction proposée : plafonner les travaux actifs et en attente par famille d’outils, avec un budget partagé de ressources. Refuser proprement une surcharge avec une réponse exploitable par l’interface. Définir des délais séparés pour l’attente et l’exécution, puis une durée totale maximale. Prévoir l’annulation contrôlée et le nettoyage du travail concerné.

Une file durable pourra être introduite si la reprise des tâches est nécessaire. Le premier objectif est une admission bornée ; le choix de la technologie vient ensuite. Les valeurs de concurrence seront déterminées lors des tests, sans inventer de plafond à partir du seul code.

Validation attendue : au-delà de la limite configurée, aucune accumulation illimitée ; les demandes excédentaires reçoivent une réponse claire ; un dépassement de délai libère les ressources du travail.

Sources : [office.ts](../server/src/services/office.ts), [ocr.ts](../server/src/services/ocr.ts), routes et services PDF.

**5. Garantir le nettoyage, y compris après erreur — P0**

Constats confirmés : certaines erreurs de lecture JSON et certains retours anticipés dans les routes de pages évitent le bloc de nettoyage des fichiers reçus. La purge périodique ne couvre que les fichiers directement présents dans le répertoire temporaire du projet. Elle ne couvre pas les répertoires temporaires natifs et ne distingue pas les fichiers expirés de ceux encore utilisés par une tâche active ou en attente.

Impact possible : accumulation après erreur ou interruption du processus ; à l’inverse, suppression d’un fichier ancien dont une conversion attend encore de se servir.

Correction proposée : centraliser la propriété et le nettoyage des fichiers par tâche, entourer tout le parcours après réception d’un `finally`, et suivre l’état actif/terminé avant toute purge. Ajouter une récupération prudente des seuls répertoires natifs appartenant à des tâches abandonnées. Ne pas effectuer de suppression globale de dossiers temporaires.

Validation attendue : succès, paramètres invalides, conversion en échec, sortie non téléchargée et interruption simulée localement ; vérifier le nettoyage et la préservation des tâches encore actives.

Sources : [pages.ts](../server/src/routes/pages.ts), [temp.ts](../server/src/utils/temp.ts), services Office/OCR.

**6. Fiabiliser la persistance des comptes et droits — P0 avant plusieurs instances**

Constat confirmé : les utilisateurs et droits d’accès sont enregistrés dans des fichiers JSON. Les modifications réécrivent le fichier complet. Les verrous ne coordonnent que les opérations d’un même processus ; une erreur de lecture ou de décodage est transformée en objet vide.

Impact possible : plusieurs processus peuvent écraser leurs modifications respectives. Une écriture interrompue peut laisser un fichier illisible ; une opération ultérieure peut alors repartir d’un état vide. Les demandes payantes provoquent aussi des lectures et écritures répétées des compteurs d’usage.

Correction proposée : adopter une persistance transactionnelle adaptée aux utilisateurs, droits et compteurs. À court terme, distinguer un fichier absent d’un fichier corrompu, empêcher les écritures à partir d’un état invalide, et rendre les écritures atomiques. Une écriture atomique seule ne résout pas la concurrence entre processus.

Validation attendue : incréments concurrents sans perte ; erreur de lecture explicitement signalée ; interruption d’écriture n’effaçant pas l’état antérieur. Ne pas augmenter le nombre d’instances applicatives avant cette vérification.

Sources : [entitlements.ts](../server/src/services/entitlements.ts) et [users.ts](../server/src/services/users.ts).

**7. Réduire la mémoire nécessaire par document — P1**

Constat confirmé : le moteur de conversion accumule les images de toutes les pages avant de fabriquer le résultat. L’OCR commence lui aussi par produire toutes les images. Les buffers d’entrée, d’images, de document reconstruit et parfois d’archive peuvent coexister.

Impact possible : la consommation dépend fortement du nombre de pages et des dimensions de rendu, même pour un petit fichier compressé. Une limite en Mo ne suffit donc pas à maîtriser la RAM.

Correction proposée : traiter et libérer les pages progressivement lorsque les bibliothèques le permettent, limiter les pixels décodés et éviter la conservation simultanée de tous les intermédiaires. Définir des budgets par tâche et par outil ; mesurer également la mémoire de l’assemblage final.

Validation attendue : comparer les pics de mémoire sur 2, 20 et 100 pages, puis sur des pages de résolution différente. Aucune réduction chiffrée n’est promise avant mesure.

Sources : [rasterize.ts](../server/src/utils/rasterize.ts), [toJpg.ts](../server/src/services/toJpg.ts), [compress.ts](../server/src/services/compress.ts), [ocr.ts](../server/src/services/ocr.ts).

**8. Corriger la libération des ressources PDF.js — P1**

Constat confirmé localement : le document retourné par la version installée n’expose pas la méthode `destroy()` appelée de manière facultative par le code. La destruction est disponible sur la tâche de chargement. Le nettoyage des pages et des surfaces graphiques existe déjà ; c’est la destruction finale qu’il faut remettre en cohérence.

Correction proposée : utiliser le cycle de vie pris en charge par la version installée, y compris après une erreur de chargement ou de rendu. Éviter qu’un appel facultatif masque une incompatibilité.

Validation attendue : vérifier la libération après succès et erreur, puis répéter les conversions lors d’un test d’endurance. Une fuite mémoire en production n’est pas démontrée à ce stade.

Source : [rasterize.ts](../server/src/utils/rasterize.ts), lignes 79–84 ; vérification locale avec PDF.js.

**9. Isoler les calculs lourds de l’API — P1**

Constat : le processus qui reçoit les requêtes réalise aussi des étapes de lecture, transformation et sérialisation PDF coûteuses. Le fait qu’une fonction soit `async` ne déplace pas automatiquement ses calculs dans un autre processus.

Correction proposée : isoler les opérations lourdes dans des travailleurs dédiés, avec la limite d’admission définie au point 4. Conserver une API capable de répondre rapidement, de fournir un état de tâche et d’annoncer une surcharge. Prévoir un fonctionnement correct après l’arrêt d’un travailleur.

Validation attendue : mesurer la latence d’une requête légère pendant compression/OCR/conversion et vérifier qu’une défaillance d’un travailleur ne rend pas l’API indisponible.

Sources : routes et services PDF ; [index.ts](../server/src/index.ts).

**10. Clarifier les quotas et limiter les rafales — P1**

Constat confirmé : les quotas gratuits sont suivis par cookie et par une table IP propre à chaque processus. Cette table n’a pas de suppression périodique des anciennes entrées. Le compteur est incrémenté avant le résultat du traitement. Aucun limiteur général de débit n’a été trouvé dans l’application.

Correction proposée : séparer trois mécanismes : quota commercial, limite de fréquence des requêtes et plafond des traitements simultanés. Définir explicitement si une tentative échouée consomme le quota ; si seuls les documents réussis doivent compter, utiliser une réservation puis une validation/libération. Expirer les anciennes entrées et partager l’état lorsque plusieurs instances sont utilisées.

Validation attendue : comportement cohérent après un échec, quotas identiques entre instances, table mémoire bornée et réponse claire lors d’une rafale.

Source : [quota.ts](../server/src/middleware/quota.ts).

**11. Ajouter les mesures nécessaires et actualiser la documentation — P1**

Constat : `/health` confirme uniquement que l’API répond. Il ne mesure ni le travail en attente, ni la disponibilité des convertisseurs, ni les ressources restantes. La documentation décrit encore Redis/BullMQ comme actifs et des limites qui diffèrent du code.

Correction proposée : mesurer par outil les tâches actives/en attente, la durée d’attente et de traitement, les erreurs, les délais dépassés, la mémoire, le retard de la boucle d’événements et l’espace temporaire. Ajouter une vérification de disponibilité distincte de la simple réponse HTTP. Aucun nom de document, contenu utilisateur ou secret ne doit figurer dans ces mesures. Documenter les limites réellement appliquées et les dépendances effectivement utilisées.

Validation attendue : pouvoir distinguer un ralentissement dû à l’attente, au traitement, à l’envoi ou au téléchargement ; détecter un convertisseur indisponible sans exécuter un traitement lourd à chaque contrôle.

Sources : [index.ts](../server/src/index.ts), [README.md](../README.md), [AGENTS.md](../AGENTS.md).

**Ordre de réalisation conseillé**

1. Corriger les résultats : compression et OCR partiel.
2. Sécuriser la réception et le cycle de vie des fichiers : limites d’envoi et nettoyage.
3. Fiabiliser la persistance ; borner concurrence, attente et durée totale.
4. Corriger le nettoyage PDF.js, réduire la mémoire et ajouter les mesures techniques.
5. Mesurer les outils individuellement, puis le trafic mixte et l’endurance ; isoler et dimensionner les travailleurs sur cette base.

**P2 — après les mesures** : envisager plusieurs machines de traitement, des groupes de travailleurs séparés pour Office/OCR, un stockage partagé des résultats et une adaptation automatique du nombre de travailleurs. Ces évolutions dépendront des volumes réels et des goulots mesurés.

Le prochain audit VPS permettra de confronter ces constats au déploiement effectif. Jusqu’à ces vérifications et aux tests autorisés, aucun nombre d’utilisateurs simultanés ni classement de capacité mensuelle n’est établi.
