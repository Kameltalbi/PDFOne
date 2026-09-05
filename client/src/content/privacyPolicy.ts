import type { Locale } from '../i18n/types';

export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export type PrivacySection = {
  title: string;
  blocks: PrivacyBlock[];
};

export type PrivacyPolicy = {
  title: string;
  updated: string;
  seoTitle: string;
  seoDescription: string;
  lead: string[];
  sections: PrivacySection[];
  summaryTitle: string;
  summary: { title: string; text: string }[];
};

const DPO_EMAIL = 'support@one2pdf.com';

const fr: PrivacyPolicy = {
  title: 'Politique de confidentialité',
  updated: 'Dernière mise à jour : septembre 2026',
  seoTitle: 'Politique de confidentialité | One2PDF',
  seoDescription: 'One2PDF traite vos documents temporairement puis les supprime. Compte Pro : e-mail et mot de passe uniquement. Gratuit sans inscription.',
  lead: [
    'One2PDF est un service exploité par 9545-8907 QUEBEC INC., Québec, Canada.',
    'One2PDF est conçu pour fonctionner avec un minimum de renseignements personnels. Vous pouvez utiliser gratuitement nos outils PDF sans créer de compte et sans fournir votre nom ou votre adresse e-mail.',
    'Un compte est nécessaire uniquement pour souscrire et accéder aux fonctionnalités payantes de One2PDF. Pour créer ce compte, nous demandons uniquement une adresse e-mail et un mot de passe.',
    'Les documents transmis à One2PDF sont traités temporairement pour effectuer l’opération demandée, puis supprimés automatiquement.',
    'La présente politique explique de manière transparente comment One2PDF traite vos documents et les renseignements nécessaires au fonctionnement du service.'
  ],
  sections: [
    {
      title: '1. Utilisation gratuite de One2PDF',
      blocks: [
        { type: 'p', text: 'Les outils gratuits de One2PDF peuvent être utilisés sans création de compte.' },
        { type: 'p', text: 'Nous ne vous demandons donc pas :' },
        { type: 'ul', items: [
          'votre nom ;',
          'votre adresse e-mail ;',
          'votre numéro de téléphone ;',
          'votre adresse postale ;',
          'ni la création d’un mot de passe.'
        ] },
        { type: 'p', text: 'Lors d’une utilisation gratuite, seules les informations techniques strictement nécessaires au fonctionnement du service, à la gestion du quota gratuit, à la sécurité et à la prévention des abus peuvent être traitées.' }
      ]
    },
    {
      title: '2. Traitement de vos documents',
      blocks: [
        { type: 'p', text: 'Lorsque vous utilisez un outil One2PDF, votre document est transmis temporairement à nos serveurs afin d’effectuer l’opération que vous avez demandée, par exemple :' },
        { type: 'ul', items: [
          'conversion ;',
          'compression ;',
          'fusion ;',
          'séparation de pages ;',
          'réorganisation ;',
          'reconnaissance optique de caractères (OCR) ;',
          'ou tout autre traitement proposé par One2PDF.'
        ] },
        { type: 'p', text: 'Le contenu du document est traité uniquement dans la mesure nécessaire à l’exécution de l’opération demandée.' },
        { type: 'p', text: 'One2PDF n’est pas un service de stockage ou d’archivage de documents.' }
      ]
    },
    {
      title: '3. Suppression automatique des documents',
      blocks: [
        { type: 'p', text: 'Nous appliquons une durée de conservation volontairement très courte.' },
        { type: 'p', text: 'Le fichier original est supprimé automatiquement dès la fin du traitement.' },
        { type: 'p', text: 'Le fichier généré est temporairement mis à votre disposition afin que vous puissiez le télécharger.' },
        { type: 'p', text: 'Après son téléchargement, il est supprimé conformément au fonctionnement du service.' },
        { type: 'p', text: 'Si le fichier généré n’est pas téléchargé, il est automatiquement supprimé au plus tard dans un délai de 15 minutes.' },
        { type: 'p', text: 'One2PDF ne conserve donc aucune copie permanente des documents transmis pour traitement.' },
        { type: 'p', text: 'Il vous appartient de conserver sur votre appareil les documents et résultats dont vous souhaitez disposer ultérieurement.' }
      ]
    },
    {
      title: '4. Compte One2PDF Pro',
      blocks: [
        { type: 'p', text: 'Un compte One2PDF est nécessaire uniquement pour les utilisateurs qui souscrivent à une offre payante.' },
        { type: 'p', text: 'Pour créer ce compte, nous demandons uniquement :' },
        { type: 'ul', items: [
          'une adresse e-mail ;',
          'un mot de passe.'
        ] },
        { type: 'p', text: 'L’adresse e-mail sert à identifier votre compte, gérer votre accès aux fonctionnalités payantes et communiquer avec vous lorsque cela est nécessaire au fonctionnement de votre compte ou de votre abonnement.' },
        { type: 'p', text: 'Les mots de passe sont stockés sous une forme protégée et ne sont pas conservés en clair.' },
        { type: 'p', text: 'One2PDF ne vous demande pas de fournir votre nom, votre adresse postale ou votre numéro de téléphone pour créer votre compte.' }
      ]
    },
    {
      title: '5. Paiements et abonnements',
      blocks: [
        { type: 'p', text: 'Les paiements et abonnements sont traités par Stripe.' },
        { type: 'p', text: 'Lorsque vous souscrivez à une offre payante, les informations nécessaires au paiement sont traitées par Stripe.' },
        { type: 'p', text: 'One2PDF ne stocke pas les informations complètes de votre carte bancaire.' },
        { type: 'p', text: 'One2PDF reçoit uniquement les informations nécessaires pour reconnaître et gérer votre abonnement, notamment :' },
        { type: 'ul', items: [
          'l’adresse e-mail associée au compte ;',
          'la formule souscrite ;',
          'le statut de l’abonnement ;',
          'les références techniques nécessaires pour associer l’abonnement à votre compte.'
        ] },
        { type: 'p', text: 'Les éventuelles informations supplémentaires demandées directement par Stripe sont traitées par Stripe conformément à ses propres pratiques de confidentialité.' }
      ]
    },
    {
      title: '6. Informations techniques',
      blocks: [
        { type: 'p', text: 'Certaines informations techniques peuvent être traitées automatiquement lorsque vous utilisez One2PDF.' },
        { type: 'p', text: 'Elles sont limitées à ce qui est nécessaire pour :' },
        { type: 'ul', items: [
          'faire fonctionner le service ;',
          'gérer les quotas d’utilisation ;',
          'maintenir une session lorsque nécessaire ;',
          'assurer la sécurité du service ;',
          'prévenir les abus ou utilisations frauduleuses ;',
          'diagnostiquer les problèmes techniques.'
        ] },
        { type: 'p', text: 'Ces informations ne sont pas utilisées pour analyser le contenu de vos documents.' }
      ]
    },
    {
      title: '7. Cookies et stockage technique',
      blocks: [
        { type: 'p', text: 'One2PDF utilise uniquement les cookies ou mécanismes de stockage nécessaires au fonctionnement du service.' },
        { type: 'p', text: 'Ils peuvent notamment servir à :' },
        { type: 'ul', items: [
          'mémoriser le quota d’utilisation gratuite ;',
          'maintenir une session ;',
          'reconnaître l’accès associé à un compte Pro ;',
          'mémoriser certains paramètres nécessaires au fonctionnement ;',
          'assurer la sécurité du service.'
        ] },
        { type: 'p', text: 'Lorsque des technologies facultatives nécessitent votre choix, elles sont utilisées conformément aux préférences que vous avez exprimées.' }
      ]
    },
    {
      title: '8. Conversion de documents Office',
      blocks: [
        { type: 'p', text: 'Certaines conversions de documents Office sont réalisées par un moteur de conversion installé sur l’infrastructure utilisée par One2PDF.' },
        { type: 'p', text: 'Lorsque ce traitement est effectué sur notre infrastructure, votre document n’est pas transmis à un service de conversion externe.' },
        { type: 'p', text: 'Les documents concernés suivent les mêmes règles de suppression automatique que les autres fichiers traités par One2PDF.' }
      ]
    },
    {
      title: '9. Reconnaissance de texte — OCR',
      blocks: [
        { type: 'p', text: 'Certaines fonctionnalités de reconnaissance optique de caractères utilisent Tesseract OCR.' },
        { type: 'p', text: 'Lorsque le traitement est réalisé directement sur notre infrastructure, votre document n’est pas transmis à un fournisseur OCR externe.' },
        { type: 'p', text: 'Le contenu reconnu est utilisé uniquement pour réaliser l’opération demandée et suit les mêmes règles de suppression que le document traité.' }
      ]
    },
    {
      title: '10. Fonctionnalités utilisant l’intelligence artificielle',
      blocks: [
        { type: 'p', text: 'Certaines fonctionnalités spécifiques, notamment le résumé ou la traduction assistée, peuvent nécessiter le recours à un prestataire externe d’intelligence artificielle.' },
        { type: 'p', text: 'Lorsque vous choisissez d’utiliser l’une de ces fonctionnalités, le contenu nécessaire à son fonctionnement peut être transmis temporairement au prestataire concerné afin d’exécuter votre demande.' },
        { type: 'p', text: 'Cette transmission intervient uniquement lorsque vous choisissez une fonctionnalité nécessitant l’utilisation d’un service d’intelligence artificielle.' },
        { type: 'p', text: 'Les outils PDF qui ne nécessitent pas d’intelligence artificielle ne transmettent pas automatiquement vos documents à un prestataire d’IA.' },
        { type: 'p', text: 'Pour les documents particulièrement sensibles ou confidentiels, nous vous recommandons de tenir compte de la nature du traitement demandé avant d’utiliser une fonctionnalité faisant appel à un service externe.' }
      ]
    },
    {
      title: '11. Prestataires techniques',
      blocks: [
        { type: 'p', text: 'One2PDF peut faire appel à des prestataires techniques lorsque leur intervention est nécessaire au fonctionnement du service.' },
        { type: 'p', text: 'Ils peuvent notamment intervenir pour :' },
        { type: 'ul', items: [
          'l’hébergement et l’infrastructure ;',
          'les paiements et abonnements ;',
          'la sécurité ;',
          'certaines fonctionnalités spécifiques faisant appel à un service externe.'
        ] },
        { type: 'p', text: 'Nous limitons les informations mises à disposition de ces prestataires à ce qui est nécessaire pour fournir le service concerné.' },
        { type: 'p', text: 'Le moteur de conversion Office et le moteur OCR, lorsqu’ils fonctionnent directement sur notre infrastructure, sont des composants logiciels du service et non des services externes auxquels vos documents sont envoyés.' }
      ]
    },
    {
      title: '12. Traitement des renseignements à l’extérieur de votre région',
      blocks: [
        { type: 'p', text: 'One2PDF est accessible depuis différents pays et certains prestataires techniques peuvent exploiter des infrastructures situées dans d’autres provinces, territoires ou pays.' },
        { type: 'p', text: 'Lorsque des renseignements personnels doivent être traités ou communiqués à l’extérieur de leur juridiction d’origine, nous prenons les mesures appropriées pour évaluer et encadrer leur protection.' }
      ]
    },
    {
      title: '13. Conservation des renseignements liés au compte',
      blocks: [
        { type: 'p', text: 'Les documents suivent les délais de suppression très courts décrits précédemment.' },
        { type: 'p', text: 'Pour les utilisateurs Pro, l’adresse e-mail et les informations nécessaires au fonctionnement du compte peuvent être conservées pendant la durée d’existence du compte.' },
        { type: 'p', text: 'Les informations nécessaires à la gestion d’un abonnement, d’une transaction, à la sécurité du service ou au respect de nos obligations peuvent être conservées pendant la durée nécessaire à ces finalités.' },
        { type: 'p', text: 'Lorsqu’un renseignement n’est plus nécessaire, il est supprimé ou rendu anonyme lorsque cela est approprié.' }
      ]
    },
    {
      title: '14. Sécurité',
      blocks: [
        { type: 'p', text: 'One2PDF applique des mesures techniques et organisationnelles destinées à protéger les renseignements sous son contrôle contre notamment :' },
        { type: 'ul', items: [
          'l’accès non autorisé ;',
          'la divulgation non autorisée ;',
          'la modification ;',
          'la perte ;',
          'la destruction ;',
          'l’utilisation abusive.'
        ] },
        { type: 'p', text: 'Le niveau de protection appliqué tient compte de la nature et de la sensibilité des informations concernées.' },
        { type: 'p', text: 'La suppression automatique et rapide des documents après leur traitement constitue également une composante importante de notre approche de sécurité.' },
        { type: 'p', text: 'Aucun service accessible par Internet ne peut toutefois garantir une sécurité absolue.' }
      ]
    },
    {
      title: '15. Incidents de confidentialité',
      blocks: [
        { type: 'p', text: 'Si un incident affectant des renseignements personnels survient, nous évaluons sa nature, les renseignements concernés et les conséquences potentielles.' },
        { type: 'p', text: 'Nous prenons les mesures appropriées afin de limiter les conséquences de l’incident et de réduire le risque qu’un événement similaire se reproduise.' },
        { type: 'p', text: 'Lorsque la situation l’exige, les personnes ou organismes concernés sont informés conformément aux obligations applicables.' }
      ]
    },
    {
      title: '16. Vos droits',
      blocks: [
        { type: 'p', text: 'Vous pouvez nous contacter concernant les renseignements personnels associés à votre compte.' },
        { type: 'p', text: 'Selon votre situation, vous pouvez notamment demander :' },
        { type: 'ul', items: [
          'l’accès aux renseignements personnels que nous détenons à votre sujet ;',
          'la correction d’informations inexactes ou incomplètes ;',
          'la suppression de certaines informations lorsqu’elles ne sont plus nécessaires ;',
          'des informations concernant l’utilisation ou la communication de vos renseignements ;',
          'le retrait d’un consentement lorsque celui-ci peut être retiré ;',
          'l’examen d’une question ou d’une plainte concernant la confidentialité.'
        ] },
        { type: 'p', text: 'Afin de protéger votre compte et vos renseignements, nous pouvons vérifier votre identité avant de répondre à certaines demandes.' },
        { type: 'p', text: 'Certaines informations peuvent devoir être conservées lorsque cela est nécessaire pour respecter une obligation applicable.' }
      ]
    },
    {
      title: '17. Responsable de la protection des renseignements personnels',
      blocks: [
        { type: 'p', text: 'Les questions, demandes ou plaintes concernant la protection des renseignements personnels peuvent être adressées au responsable de la protection des renseignements personnels de :' },
        { type: 'ul', items: [
          '9545-8907 QUEBEC INC.',
          'Service : One2PDF',
          'Québec, Canada'
        ] },
        { type: 'p', text: `Courriel : ${DPO_EMAIL}` },
        { type: 'p', text: 'Les demandes sont examinées et traitées dans les délais applicables.' }
      ]
    },
    {
      title: '18. Modifications de cette politique',
      blocks: [
        { type: 'p', text: 'Nous pouvons mettre à jour cette Politique de confidentialité lorsque les fonctionnalités, les pratiques ou les prestataires de One2PDF évoluent.' },
        { type: 'p', text: 'La date figurant en haut de cette page indique la dernière mise à jour.' },
        { type: 'p', text: 'Lorsque des modifications importantes affectent la manière dont les renseignements personnels sont traités, nous prenons les mesures appropriées pour en informer les utilisateurs concernés.' }
      ]
    },
    {
      title: '19. Contact',
      blocks: [
        { type: 'p', text: 'One2PDF' },
        { type: 'p', text: 'Exploité par 9545-8907 QUEBEC INC.' },
        { type: 'p', text: 'Québec, Canada' },
        { type: 'p', text: 'Pour toute question générale, vous pouvez nous contacter via la page Contact de One2PDF.' },
        { type: 'p', text: 'Pour toute demande relative à la protection des renseignements personnels, vous pouvez contacter le responsable indiqué à la section 17.' }
      ]
    }
  ],
  summaryTitle: 'La confidentialité sur One2PDF en bref',
  summary: [
    { title: 'Gratuit sans compte', text: 'Vous pouvez utiliser les outils gratuits sans fournir votre nom, votre adresse e-mail ou créer un compte.' },
    { title: 'Compte Pro minimal', text: 'Pour les offres payantes, One2PDF demande uniquement une adresse e-mail et un mot de passe.' },
    { title: 'Traitement temporaire', text: 'Votre document est traité uniquement pour réaliser l’opération demandée.' },
    { title: 'Suppression automatique', text: 'Le fichier original est supprimé dès la fin du traitement.' },
    { title: 'Aucun stockage permanent', text: 'One2PDF n’est pas un service de stockage de documents.' },
    { title: '15 minutes maximum', text: 'Un fichier généré qui n’est pas téléchargé est automatiquement supprimé au plus tard dans un délai de 15 minutes.' }
  ]
};

const en: PrivacyPolicy = {
  title: 'Privacy policy',
  updated: 'Last updated: September 2026',
  seoTitle: 'Privacy Policy | One2PDF',
  seoDescription: 'One2PDF processes your documents temporarily, then deletes them. Pro accounts need only an email and password. Free tools require no signup.',
  lead: [
    'One2PDF is operated by 9545-8907 QUEBEC INC., Quebec, Canada.',
    'One2PDF is designed to work with a minimum of personal information. You can use our free PDF tools without creating an account and without providing your name or email address.',
    'An account is required only to subscribe and access One2PDF paid features. To create that account, we ask only for an email address and a password.',
    'Documents sent to One2PDF are processed temporarily to perform the requested operation, then deleted automatically.',
    'This policy explains transparently how One2PDF handles your documents and the information needed to operate the service.'
  ],
  sections: [
    {
      title: '1. Free use of One2PDF',
      blocks: [
        { type: 'p', text: 'One2PDF free tools can be used without creating an account.' },
        { type: 'p', text: 'We therefore do not ask for:' },
        { type: 'ul', items: [
          'your name;',
          'your email address;',
          'your phone number;',
          'your postal address;',
          'or the creation of a password.'
        ] },
        { type: 'p', text: 'When you use the service for free, only technical information strictly needed to operate the service, manage the free quota, maintain security and prevent abuse may be processed.' }
      ]
    },
    {
      title: '2. How your documents are processed',
      blocks: [
        { type: 'p', text: 'When you use a One2PDF tool, your document is sent temporarily to our servers to perform the operation you requested, for example:' },
        { type: 'ul', items: [
          'conversion;',
          'compression;',
          'merge;',
          'splitting pages;',
          'reordering;',
          'optical character recognition (OCR);',
          'or any other processing offered by One2PDF.'
        ] },
        { type: 'p', text: 'Document content is processed only as needed to complete the requested operation.' },
        { type: 'p', text: 'One2PDF is not a document storage or archiving service.' }
      ]
    },
    {
      title: '3. Automatic deletion of documents',
      blocks: [
        { type: 'p', text: 'We apply a deliberately very short retention period.' },
        { type: 'p', text: 'The original file is deleted automatically as soon as processing ends.' },
        { type: 'p', text: 'The generated file is made available temporarily so you can download it.' },
        { type: 'p', text: 'After you download it, it is deleted as part of how the service works.' },
        { type: 'p', text: 'If the generated file is not downloaded, it is deleted automatically within 15 minutes at the latest.' },
        { type: 'p', text: 'One2PDF therefore keeps no permanent copy of documents submitted for processing.' },
        { type: 'p', text: 'It is your responsibility to keep on your device any documents and results you may need later.' }
      ]
    },
    {
      title: '4. One2PDF Pro account',
      blocks: [
        { type: 'p', text: 'A One2PDF account is required only for users who subscribe to a paid plan.' },
        { type: 'p', text: 'To create this account, we ask only for:' },
        { type: 'ul', items: [
          'an email address;',
          'a password.'
        ] },
        { type: 'p', text: 'The email address is used to identify your account, manage access to paid features, and contact you when needed for your account or subscription.' },
        { type: 'p', text: 'Passwords are stored in a protected form and are not kept in plain text.' },
        { type: 'p', text: 'One2PDF does not ask for your name, postal address or phone number to create your account.' }
      ]
    },
    {
      title: '5. Payments and subscriptions',
      blocks: [
        { type: 'p', text: 'Payments and subscriptions are processed by Stripe.' },
        { type: 'p', text: 'When you subscribe to a paid plan, payment information is processed by Stripe.' },
        { type: 'p', text: 'One2PDF does not store your full card details.' },
        { type: 'p', text: 'One2PDF receives only the information needed to recognize and manage your subscription, including:' },
        { type: 'ul', items: [
          'the email address associated with the account;',
          'the plan you subscribed to;',
          'subscription status;',
          'technical references needed to link the subscription to your account.'
        ] },
        { type: 'p', text: 'Any additional information requested directly by Stripe is processed by Stripe under its own privacy practices.' }
      ]
    },
    {
      title: '6. Technical information',
      blocks: [
        { type: 'p', text: 'Some technical information may be processed automatically when you use One2PDF.' },
        { type: 'p', text: 'It is limited to what is needed to:' },
        { type: 'ul', items: [
          'operate the service;',
          'manage usage quotas;',
          'maintain a session when needed;',
          'keep the service secure;',
          'prevent abuse or fraudulent use;',
          'diagnose technical issues.'
        ] },
        { type: 'p', text: 'This information is not used to analyze the content of your documents.' }
      ]
    },
    {
      title: '7. Cookies and technical storage',
      blocks: [
        { type: 'p', text: 'One2PDF uses only cookies or storage mechanisms required to operate the service.' },
        { type: 'p', text: 'They may be used to:' },
        { type: 'ul', items: [
          'remember the free-plan usage quota;',
          'maintain a session;',
          'recognize access associated with a Pro account;',
          'remember settings needed for the service to work;',
          'keep the service secure.'
        ] },
        { type: 'p', text: 'When optional technologies require your choice, they are used according to the preferences you expressed.' }
      ]
    },
    {
      title: '8. Office document conversion',
      blocks: [
        { type: 'p', text: 'Some Office document conversions are performed by a conversion engine installed on the infrastructure used by One2PDF.' },
        { type: 'p', text: 'When this processing is done on our infrastructure, your document is not sent to an external conversion service.' },
        { type: 'p', text: 'Those documents follow the same automatic deletion rules as other files processed by One2PDF.' }
      ]
    },
    {
      title: '9. Text recognition — OCR',
      blocks: [
        { type: 'p', text: 'Some optical character recognition features use Tesseract OCR.' },
        { type: 'p', text: 'When processing is done directly on our infrastructure, your document is not sent to an external OCR provider.' },
        { type: 'p', text: 'Recognized content is used only to complete the requested operation and follows the same deletion rules as the processed document.' }
      ]
    },
    {
      title: '10. Features that use artificial intelligence',
      blocks: [
        { type: 'p', text: 'Some specific features, including assisted summarization or translation, may require an external artificial intelligence provider.' },
        { type: 'p', text: 'When you choose to use one of these features, the content needed to run it may be sent temporarily to the relevant provider to fulfill your request.' },
        { type: 'p', text: 'This transfer happens only when you choose a feature that requires an artificial intelligence service.' },
        { type: 'p', text: 'PDF tools that do not require artificial intelligence do not automatically send your documents to an AI provider.' },
        { type: 'p', text: 'For particularly sensitive or confidential documents, we recommend considering the nature of the requested processing before using a feature that relies on an external service.' }
      ]
    },
    {
      title: '11. Technical providers',
      blocks: [
        { type: 'p', text: 'One2PDF may use technical providers when their involvement is needed to operate the service.' },
        { type: 'p', text: 'They may be involved in:' },
        { type: 'ul', items: [
          'hosting and infrastructure;',
          'payments and subscriptions;',
          'security;',
          'certain specific features that rely on an external service.'
        ] },
        { type: 'p', text: 'We limit the information made available to these providers to what is needed to deliver the relevant service.' },
        { type: 'p', text: 'The Office conversion engine and the OCR engine, when they run directly on our infrastructure, are software components of the service and not external services to which your documents are sent.' }
      ]
    },
    {
      title: '12. Processing information outside your region',
      blocks: [
        { type: 'p', text: 'One2PDF is available from different countries, and some technical providers may operate infrastructure in other provinces, territories or countries.' },
        { type: 'p', text: 'When personal information must be processed or disclosed outside its original jurisdiction, we take appropriate steps to assess and frame its protection.' }
      ]
    },
    {
      title: '13. Retention of account-related information',
      blocks: [
        { type: 'p', text: 'Documents follow the very short deletion timelines described above.' },
        { type: 'p', text: 'For Pro users, the email address and information needed to operate the account may be kept for the life of the account.' },
        { type: 'p', text: 'Information needed to manage a subscription or transaction, to secure the service or to meet our obligations may be kept for as long as those purposes require.' },
        { type: 'p', text: 'When information is no longer needed, it is deleted or made anonymous where appropriate.' }
      ]
    },
    {
      title: '14. Security',
      blocks: [
        { type: 'p', text: 'One2PDF applies technical and organizational measures intended to protect information under its control against, among other things:' },
        { type: 'ul', items: [
          'unauthorized access;',
          'unauthorized disclosure;',
          'modification;',
          'loss;',
          'destruction;',
          'misuse.'
        ] },
        { type: 'p', text: 'The level of protection applied takes into account the nature and sensitivity of the information concerned.' },
        { type: 'p', text: 'Automatic, prompt deletion of documents after processing is also an important part of our security approach.' },
        { type: 'p', text: 'No internet-accessible service can, however, guarantee absolute security.' }
      ]
    },
    {
      title: '15. Privacy incidents',
      blocks: [
        { type: 'p', text: 'If an incident affecting personal information occurs, we assess its nature, the information involved and the potential consequences.' },
        { type: 'p', text: 'We take appropriate steps to limit the consequences of the incident and reduce the risk of a similar event happening again.' },
        { type: 'p', text: 'When required, the people or organizations concerned are notified in accordance with applicable obligations.' }
      ]
    },
    {
      title: '16. Your rights',
      blocks: [
        { type: 'p', text: 'You may contact us about personal information associated with your account.' },
        { type: 'p', text: 'Depending on your situation, you may request:' },
        { type: 'ul', items: [
          'access to the personal information we hold about you;',
          'correction of inaccurate or incomplete information;',
          'deletion of certain information when it is no longer needed;',
          'information about the use or disclosure of your information;',
          'withdrawal of consent where consent can be withdrawn;',
          'review of a privacy question or complaint.'
        ] },
        { type: 'p', text: 'To protect your account and your information, we may verify your identity before responding to some requests.' },
        { type: 'p', text: 'Some information may need to be kept when required to meet an applicable obligation.' }
      ]
    },
    {
      title: '17. Privacy officer',
      blocks: [
        { type: 'p', text: 'Questions, requests or complaints about the protection of personal information may be sent to the privacy officer of:' },
        { type: 'ul', items: [
          '9545-8907 QUEBEC INC.',
          'Service: One2PDF',
          'Quebec, Canada'
        ] },
        { type: 'p', text: `Email: ${DPO_EMAIL}` },
        { type: 'p', text: 'Requests are reviewed and handled within applicable time limits.' }
      ]
    },
    {
      title: '18. Changes to this policy',
      blocks: [
        { type: 'p', text: 'We may update this Privacy Policy when One2PDF features, practices or providers change.' },
        { type: 'p', text: 'The date at the top of this page indicates the latest update.' },
        { type: 'p', text: 'When material changes affect how personal information is processed, we take appropriate steps to inform the users concerned.' }
      ]
    },
    {
      title: '19. Contact',
      blocks: [
        { type: 'p', text: 'One2PDF' },
        { type: 'p', text: 'Operated by 9545-8907 QUEBEC INC.' },
        { type: 'p', text: 'Quebec, Canada' },
        { type: 'p', text: 'For general questions, you can reach us through the One2PDF Contact page.' },
        { type: 'p', text: 'For requests about the protection of personal information, you may contact the officer listed in section 17.' }
      ]
    }
  ],
  summaryTitle: 'One2PDF privacy in short',
  summary: [
    { title: 'Free without an account', text: 'You can use the free tools without providing your name, email address or creating an account.' },
    { title: 'Minimal Pro account', text: 'For paid plans, One2PDF asks only for an email address and a password.' },
    { title: 'Temporary processing', text: 'Your document is processed only to complete the requested operation.' },
    { title: 'Automatic deletion', text: 'The original file is deleted as soon as processing ends.' },
    { title: 'No permanent storage', text: 'One2PDF is not a document storage service.' },
    { title: '15 minutes maximum', text: 'A generated file that is not downloaded is deleted automatically within 15 minutes at the latest.' }
  ]
};

export const privacyOfficerEmail = DPO_EMAIL;

export function getPrivacyPolicy(locale: Locale): PrivacyPolicy {
  return locale === 'fr' ? fr : en;
}
