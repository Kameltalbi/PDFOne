import type { BlogPost } from './blog';

/**
 * Portuguese articles published through getBlogPosts for the pt locale only.
 */
export const PORTUGUESE_BLOG_DRAFTS: BlogPost[] = [
  {
    slug: 'comprimir-pdf-email',
    publishedIso: '2026-08-28',
    publishedLabel: '28 de agosto de 2026',
    seoTitle: 'PDF demasiado grande para o e-mail | One2PDF',
    seoDescription: 'O Gmail ou o Outlook recusam um PDF acima de 25 MB? Comprima-o online, sem instalar um programa, e envie-o.',
    keywords: 'comprimir PDF, PDF demasiado grande, Gmail 25 MB',
    title: 'Como reduzir um PDF demasiado grande para enviar por e-mail',
    excerpt: 'O Gmail, o Outlook ou um formulário recusaram o anexo. Eis porque um PDF fica tão pesado e como o tornar mais leve em segundos, sem instalar um programa.',
    body: [
      { type: 'p', text: 'O dossiê, o currículo ou o portefólio estão prontos, e o envio para: «O ficheiro ultrapassa o tamanho máximo (25 MB).» O Gmail, o Outlook e muitos formulários cortam aí. Na maior parte dos casos, um PDF reduz-se em poucos segundos, sem o voltar a imprimir e sem o tornar ilegível.' },
      { type: 'h2', text: 'Porque é que alguns PDF ficam tão pesados' },
      { type: 'p', text: 'Um PDF não é «só texto». Por detrás de cada página há imagens, tipos de letra e, por vezes, camadas de uma digitalização. Quanto menos estes elementos estão otimizados, mais o ficheiro cresce, mesmo num documento curto.' },
      { type: 'h3', text: 'Imagens em alta resolução' },
      { type: 'p', text: 'Uma digitalização, uma foto do telemóvel ou uma imagem sem compressão pesam mais do que o texto. 300 dpi servem para imprimir e, num e-mail, costumam ser a mais. É a causa mais frequente de um PDF que o Gmail recusa.' },
      { type: 'h3', text: 'Páginas, gráficos e tipos de letra somam-se' },
      { type: 'p', text: 'Um relatório de 40 páginas, tabelas coladas, capturas de ecrã e vários tipos de letra incorporados incham a estrutura. Juntar vários PDF sem os reduzir primeiro agrava o resultado: as imagens em resolução plena acumulam-se.' },
      { type: 'h2', text: 'O caminho mais rápido, sem instalação' },
      { type: 'p', text: 'Para um envio pontual não precisa de um programa de secretária pago. Uma ferramenta online chega na maior parte dos casos: reduz as imagens e otimiza o ficheiro, com um resultado legível no ecrã.' },
      { type: 'h3', text: 'Como comprimir um PDF grande no One2PDF' },
      {
        type: 'ol',
        items: [
          [
            'Abra a ',
            { text: 'ferramenta para comprimir PDF', to: '/pt/compress' },
            '.'
          ],
          'Largue o documento na zona de envio (computador ou telemóvel).',
          'Deixe a ferramenta otimizar as imagens e a estrutura. Escolha um nível mais forte se o ficheiro continuar acima de 25 MB.',
          'Transfira o PDF novo, pronto para o e-mail.'
        ]
      },
      { type: 'h2', text: 'Se o ficheiro continuar demasiado pesado' },
      { type: 'h3', text: 'Comprimir antes de juntar' },
      {
        type: 'p',
        parts: [
          'Se tiver de reunir um contrato, anexos e uma digitalização, reduza primeiro cada PDF e junte-os depois. Um ficheiro já comprimido combina-se melhor do que uma pilha de originais em resolução plena. A ferramenta ',
          { text: 'Juntar PDF', to: '/pt/merge' },
          ' respeita a ordem das miniaturas.'
        ]
      },
      { type: 'h3', text: 'Partir de imagens pesadas' },
      {
        type: 'p',
        parts: [
          'Uma captura PNG ou um JPEG de 8 MB não precisa de entrar no PDF tal como está. Converter primeiro as imagens, ou comprimir o PDF depois de o montar, dá muitas vezes um peso de partida bem mais baixo para o e-mail. ',
          { text: 'JPG para PDF', to: '/pt/jpg-to-pdf' }
        ]
      },
      { type: 'p', text: 'Não deixe um teto de 25 MB bloquear um currículo, um dossiê de cliente ou um envio oficial. Assim que um formulário ou uma caixa de correio recusar o anexo, uma passagem pela compressão poupa um segundo envio.' }
    ],
    cta: 'Comprimir PDF',
    ctaTo: '/pt/compress'
  },
  {
    slug: 'privacidade-pdf-online',
    publishedIso: '2026-09-02',
    publishedLabel: '2 de setembro de 2026',
    seoTitle: 'PDF online: não enviar ficheiros para um servidor desconhecido | One2PDF',
    seoDescription: 'Antes de usar uma ferramenta PDF grátis, veja para onde vão os ficheiros e como escolher um serviço transparente.',
    keywords: 'privacidade PDF, PDF online, apagar ficheiros',
    title: 'PDF online: como evitar enviar ficheiros para um servidor desconhecido',
    excerpt: 'Uma ferramenta PDF grátis no navegador é prática. Vale a pena saber o que acontece ao ficheiro antes de carregar um contrato ou um documento de identificação.',
    body: [
      { type: 'p', text: 'Tem um contrato, uma fatura ou um PDF clínico para converter, juntar ou comprimir. Pesquisa «converter PDF online», clica no primeiro resultado, larga o ficheiro… e não sabe o que lhe acontece.' },
      { type: 'p', text: 'Esse é o problema central de quase todas as ferramentas PDF grátis online: o ficheiro vai para algum lado, e a maior parte das pessoas não tem tempo nem formação técnica para verificar onde, nem durante quanto tempo fica lá.' },
      { type: 'p', text: 'Este guia explica o que acontece de facto quando usa uma ferramenta PDF online, porque isso não é automaticamente um problema — se escolher o serviço certo — e o que convém confirmar antes de confiar um documento sensível.' },
      { type: 'h2', text: 'Porque é que quase todas as ferramentas funcionam por envio' },
      { type: 'p', text: 'Ao contrário do que alguns sítios sugerem, a grande maioria das ferramentas PDF online — incluindo as mais conhecidas — não trata o ficheiro «no seu aparelho». Enviam-no para um servidor, executam a operação (conversão, junção, compressão, OCR) e devolvem o resultado.' },
      { type: 'p', text: 'Há uma razão simples: algumas operações são pesadas demais para correrem bem no navegador. Passar um PDF a Word ou Excel com a disposição original exige motores de conversão que o navegador não executa sozinho. O mesmo vale para o reconhecimento de texto (OCR) numa digitalização.' },
      { type: 'p', text: 'Existem ferramentas que tratam tudo no navegador (WebAssembly). Muitas vezes limitam-se a operações simples e podem ser mais lentas ou menos fiáveis em ficheiros grandes ou conversões complexas.' },
      { type: 'p', text: 'A pergunta certa não é «o meu ficheiro é enviado para algum lado?» — a resposta é quase sempre sim — mas «para onde, durante quanto tempo e por quem?».' },
      { type: 'h2', text: 'O que verificar antes de confiar numa ferramenta PDF' },
      { type: 'p', text: 'Antes de largar um documento sensível num conversor online, reserve trinta segundos para estes pontos:' },
      { type: 'h3', text: '1. A política de apagamento' },
      { type: 'p', text: 'Um serviço sério diz com clareza quanto tempo o ficheiro fica nos servidores depois do tratamento — de preferência minutos ou poucas horas, nunca «indefinidamente» ou «não especificado». Essa informação deve ser fácil de encontrar.' },
      { type: 'h3', text: '2. Onde estão os servidores e que lei se aplica' },
      { type: 'p', text: 'Um ficheiro tratado num servidor na União Europeia fica abrangido pelo RGPD. Um ficheiro tratado no Canadá pode cair sob a PIPEDA ou, para residentes do Quebeque, a Lei 25. Estes quadros impõem deveres reais de recolha, conservação e apagamento.' },
      { type: 'h3', text: '3. O que acontece com as funções de IA' },
      { type: 'p', text: 'Cada vez mais ferramentas PDF acrescentam resumo ou tradução com inteligência artificial. É útil, mas muitas vezes significa que um terceiro (o fornecedor de IA) também recebe o conteúdo. Um serviço transparente deve dizer quais as funções que passam por um fornecedor de IA e quais nunca passam.' },
      { type: 'h3', text: '4. A clareza do percurso técnico' },
      { type: 'p', text: 'Um serviço que explica como trata os ficheiros — que ferramentas, que passos — inspira mais confiança do que uma caixa negra que só diz «os seus ficheiros estão seguros».' },
      { type: 'h3', text: '5. O modelo de preços' },
      { type: 'p', text: 'Uma ferramenta com preços claros, sem um período experimental que se transforma numa subscrição escondida, merece em geral mais confiança do que um serviço cujo modelo assenta na confusão da faturação.' },
      { type: 'h2', text: 'O que o One2PDF faz na prática' },
      { type: 'p', text: 'No One2PDF escolhemos a transparência em vez de uma promessa de marketing impossível de verificar. Na prática:' },
      {
        type: 'ul',
        items: [
          'Os ficheiros são tratados num servidor seguro — não dizemos o contrário.',
          'O tratamento usa ferramentas estabelecidas para juntar, comprimir, proteger e editar; um motor de conversão para Word, Excel e PowerPoint; e OCR para documentos digitalizados.',
          'Resumir e traduzir, que passam por um fornecedor de IA, estão separados do resto e só correm se os iniciar.',
          'Depois de o ficheiro ser tratado e transferido, é apagado automaticamente dos servidores.',
          'Não é preciso cartão para experimentar, e nenhuma subscrição começa sem uma ação clara da sua parte.'
        ]
      },
      { type: 'p', text: 'Não dizemos que nada sai do computador — isso seria falso. Preferimos dizer exatamente o que acontece, para poder decidir com os factos.' },
      { type: 'h2', text: 'Em resumo' },
      {
        type: 'ul',
        items: [
          'Quase todas as ferramentas PDF online enviam o ficheiro para um servidor. Isso, por si, não é um alarme.',
          'A confiança vem de prazos claros, de um lugar de tratamento identificado e de uma frase honesta sobre a IA.',
          'Desconfie de uma promessa de «zero envio» que não se consegue demonstrar.'
        ]
      },
      {
        type: 'p',
        parts: [
          'O texto completo está na ',
          { text: 'política de privacidade', to: '/privacy' },
          '. Mantém-se em inglês até existir uma versão portuguesa revista.'
        ]
      }
    ],
    cta: 'Ver as ferramentas PDF',
    ctaTo: '/pt/tools'
  }
];
