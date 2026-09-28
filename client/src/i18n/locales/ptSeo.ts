import type { PageSeoCopy } from '../types';

/** Portuguese SEO copy. Not wired into sitemap, hreflang or prerender. */
export const seoPt = {
  wordToPdf: {
    seoTitle: 'Converter Word para PDF | One2PDF',
    seoDescription: 'Passe um ficheiro Word (.doc, .docx) a PDF no navegador, sem instalar o Microsoft Word.',
    seoH2: 'Como converter Word para PDF',
    seoP1: 'Um currículo, um contrato ou um relatório chega melhor se for PDF. Carregue .doc, .docx, .odt ou .rtf, inicie a conversão e transfira o PDF.',
    seoP2: 'A disposição, as fontes e as imagens mantêm-se o suficiente para ler no ecrã ou imprimir. Serve para um e-mail, uma candidatura ou um formulário que pede PDF.',
    seoP3: 'O ficheiro original não fica guardado. O PDF fica disponível para transferir e depois é apagado. Sem transferência, o One2PDF remove-o no máximo em 15 minutos. O uso ocasional não exige conta.',
    howTitle: 'Converter Word para PDF',
    howSteps: [
      'Carregue o ficheiro Word (.doc, .docx, .odt ou .rtf)',
      'Inicie a conversão no navegador',
      'Transfira o PDF'
    ],
    faqTitle: 'Perguntas sobre Word para PDF',
    faq: [
      {
        question: 'É preciso ter o Microsoft Word instalado?',
        answer: 'Não. O One2PDF converte .doc, .docx, .odt e .rtf no navegador. Não precisa do Word no computador.'
      },
      {
        question: 'Converter Word para PDF é grátis?',
        answer: 'Sim, sem conta. O plano gratuito permite 5 documentos por dia e ficheiros até 20 MB. Passe e Pro: sem limite diário de processamentos; ficheiros até 100 MB.'
      },
      {
        question: 'O One2PDF guarda o meu ficheiro Word?',
        answer: 'Não. O original é apagado no fim do processamento. O PDF pode ser transferido uma vez e depois é removido. Sem transferência, isso acontece no máximo em 15 minutos.'
      }
    ]
  },
  pdfToWord: {
    seoTitle: 'Converter PDF para Word | One2PDF',
    seoDescription: 'Transforme um PDF num documento Word editável. A conversão faz-se online, sem o Microsoft Word.',
    seoH2: 'Como tornar um PDF editável no Word',
    seoP1: 'Se o texto está fechado num PDF, o One2PDF passa-o a DOC ou DOCX. Carregue o ficheiro, inicie a conversão e abra o resultado no Word.',
    seoP2: 'O texto e uma disposição utilizável são reconstruídos para corrigir, comentar ou copiar trechos. Um digitalização que é só imagem pode precisar de OCR antes.',
    seoP3: 'O PDF original não fica guardado. O ficheiro Word fica disponível para transferir e depois é apagado. O uso ocasional não pede nome nem e-mail.',
    howTitle: 'Converter um PDF para Word',
    howSteps: [
      'Carregue o PDF que quer editar',
      'Inicie a conversão',
      'Transfira o ficheiro Word e abra-o'
    ],
    faqTitle: 'Perguntas sobre PDF para Word',
    faq: [
      {
        question: 'O ficheiro Word fica editável?',
        answer: 'Sim. A conversão reconstrói o texto e uma disposição utilizável. Digitalizações complexas podem precisar de OCR se o PDF for só uma imagem.'
      },
      {
        question: 'Preciso de conta para converter PDF para Word?',
        answer: 'Não. O uso gratuito não pede nome nem e-mail. A conta Pro é só para quem paga e usa e-mail mais palavra-passe.'
      },
      {
        question: 'Os ficheiros ficam guardados depois da conversão?',
        answer: 'Não. O PDF original é apagado no fim. O resultado Word desaparece após a transferência, ou no máximo em 15 minutos se não o transferir.'
      }
    ]
  },
  excelToPdf: {
    seoTitle: 'Converter Excel para PDF | One2PDF',
    seoDescription: 'Fixe um livro Excel num PDF estável, para ninguém alterar as células. Sem instalar o Microsoft Excel.',
    seoH2: 'Como passar do Excel a um PDF estável',
    seoP1: 'Carregue .xls, .xlsx, .ods ou .csv. A conversão fixa colunas, totais e a disposição num PDF pronto a enviar.',
    seoP2: 'Serve para um orçamento, um relatório ou uma contabilidade que deve chegar sem alterações.',
    seoP3: 'O livro original não fica guardado. O PDF fica disponível para transferir e depois é apagado. O uso ocasional não exige conta.'
  },
  pptToPdf: {
    seoTitle: 'Converter PowerPoint para PDF | One2PDF',
    seoDescription: 'Passe uma apresentação PowerPoint a PDF para a enviar ou arquivar sem o destinatário ter PowerPoint.',
    seoH2: 'Como converter PowerPoint para PDF',
    seoP1: 'Carregue .ppt, .pptx ou .odp. A ordem dos diapositivos mantém-se num PDF que se pode projetar, imprimir ou guardar.',
    seoP2: 'Serve para um e-mail, material de formação ou um dossiê que deve abrir igual em qualquer equipamento.',
    seoP3: 'A apresentação original não fica guardada. O PDF fica um momento para transferir e depois é apagado. O uso ocasional não exige conta.'
  },
  protect: {
    seoTitle: 'Proteger PDF com palavra-passe | One2PDF',
    seoDescription: 'Cifre um PDF para só abrir com a palavra-passe que escolher. O processo faz-se no navegador.',
    seoH2: 'Como proteger um PDF com palavra-passe',
    seoP1: 'Carregue o ficheiro, escreva uma palavra-passe, confirme-a e transfira o PDF bloqueado. Quem não a conhecer não consegue abrir.',
    seoP2: 'O conteúdo não muda para quem tem a chave. Serve para um contrato, um recibo de vencimento ou um documento que não deve abrir sem controlo.',
    seoP3: 'O original não fica guardado. O PDF protegido é apagado depois da transferência. Guarde a palavra-passe: o One2PDF não a recupera. O uso ocasional não exige conta.'
  },
  toJpg: {
    seoTitle: 'Converter PDF para JPG | One2PDF',
    seoDescription: 'Exporte cada página de um PDF como imagem JPG. Se houver várias, vêm juntas num ZIP.',
    seoH2: 'Como converter um PDF para JPG',
    seoP1: 'Carregue o PDF e inicie a conversão. Cada página passa a JPG, útil para um chat, um site ou uma galeria.',
    seoP2: 'Várias páginas agrupam-se num ZIP. Uma só página transfere-se como imagem.',
    seoP3: 'O PDF de origem não fica guardado. As imagens são apagadas depois da transferência. O uso ocasional não exige conta.'
  },
  jpgToPdf: {
    seoTitle: 'Converter JPG para PDF | One2PDF',
    seoDescription: 'Junte fotos JPG, PNG ou WebP num só PDF, pela ordem das miniaturas. Sem instalar um programa.',
    seoH2: 'Como converter imagens JPG para PDF',
    seoP1: 'Carregue JPG, PNG ou WebP, arraste as miniaturas para fixar a ordem e crie um documento pronto a enviar.',
    seoP2: 'Cada imagem ocupa uma página. Serve para uma digitalização do telemóvel, capturas de ecrã ou um dossiê de fotos.',
    seoP3: 'As imagens não ficam guardadas. O PDF é apagado depois da transferência, ou no máximo em 15 minutos se não o transferir. O uso ocasional não exige conta.',
    howTitle: 'Converter JPG para PDF',
    howSteps: [
      'Carregue imagens JPG, PNG ou WebP',
      'Reordene as miniaturas se precisar',
      'Transfira o PDF'
    ],
    faqTitle: 'Perguntas sobre JPG para PDF',
    faq: [
      {
        question: 'Posso juntar várias imagens num só PDF?',
        answer: 'Sim. Carregue JPG, PNG ou WebP, ordene as miniaturas e crie um PDF.'
      },
      {
        question: 'É preciso instalar um programa?',
        answer: 'Não. A conversão faz-se no navegador.'
      },
      {
        question: 'O One2PDF guarda as minhas fotos?',
        answer: 'Não. São processadas só durante a operação. Os originais são apagados no fim. O PDF desaparece após a transferência ou no máximo em 15 minutos.'
      }
    ]
  },
  edit: {
    seoTitle: 'Editar PDF online | One2PDF',
    seoDescription: 'Acrescente texto, um desenho, uma imagem ou uma assinatura ao PDF e exporte o documento. Sem Adobe Acrobat.',
    seoH2: 'Como editar um PDF no navegador',
    seoP1: 'Carregue o ficheiro, acrescente texto, desenhe, insira uma imagem ou uma assinatura e exporte o documento alterado.',
    seoP2: 'A pré-visualização mostra cada alteração página a página, antes de transferir. Serve para anotar uma digitalização ou assinar um ficheiro.',
    seoP3: 'O original não fica guardado. O PDF editado fica disponível para transferir e depois é apagado. O uso ocasional não exige conta.'
  },
  rotate: {
    seoTitle: 'Girar PDF online | One2PDF',
    seoDescription: 'Endireite uma página ao contrário ou uma digitalização de lado. Gire uma página ou todas, de 90° em 90°.',
    seoH2: 'Como girar páginas de um PDF',
    seoP1: 'Carregue o PDF e gire a página visível ou todas as páginas em passos de 90°. Depois transfira o documento corrigido.',
    seoP2: 'Serve para uma digitalização do telemóvel ou uma página invertida. O conteúdo mantém-se; só a orientação muda.',
    seoP3: 'O original não fica guardado. O PDF girado é apagado depois da transferência. O uso ocasional não exige conta.',
    howTitle: 'Girar um PDF',
    howSteps: [
      'Carregue o PDF com a página torta',
      'Gire a página ou todas as páginas 90°',
      'Transfira o PDF corrigido'
    ],
    faqTitle: 'Perguntas sobre girar PDF',
    faq: [
      {
        question: 'Posso girar só uma página?',
        answer: 'Sim. Escolha a página e gire-a de 90° em 90°. Também pode girar todas as páginas de uma vez.'
      },
      {
        question: 'Girar altera o conteúdo?',
        answer: 'Não. Texto e imagens mantêm-se. Só muda a orientação da página.'
      },
      {
        question: 'O ficheiro fica guardado?',
        answer: 'Não. O original é apagado no fim do processamento. O resultado desaparece após a transferência ou no máximo em 15 minutos.'
      }
    ]
  },
  watermark: {
    seoTitle: 'Marca de água num PDF | One2PDF',
    seoDescription: 'Marque todas as páginas com um texto como Confidencial ou Rascunho. Ajuste a opacidade e transfira o PDF.',
    seoH2: 'Como pôr uma marca de água num PDF',
    seoP1: 'Escreva o texto, escolha a opacidade e a orientação e aplique-o a todas as páginas.',
    seoP2: 'A pré-visualização mostra o texto antes de exportar. Fica legível sem tapar o conteúdo por completo.',
    seoP3: 'O original não fica guardado. O PDF marcado é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  pdfToExcel: {
    seoTitle: 'Converter PDF para Excel | One2PDF',
    seoDescription: 'Passe tabelas de um PDF para um livro Excel para filtrar ou recalcular. Sem instalar o Microsoft Excel.',
    seoH2: 'Como passar tabelas de PDF para Excel',
    seoP1: 'Carregue o PDF e inicie a conversão. Colunas e linhas são reconstruídas tanto quanto a disposição permite.',
    seoP2: 'Serve para um orçamento, um relatório ou números que queira filtrar ou recalcular.',
    seoP3: 'O PDF original não fica guardado. O ficheiro Excel fica disponível para transferir e depois é apagado. O uso ocasional não exige conta.'
  },
  pdfToPpt: {
    seoTitle: 'Converter PDF para PowerPoint | One2PDF',
    seoDescription: 'Transforme cada página de um PDF num diapositivo PowerPoint. Sem instalar o Microsoft PowerPoint.',
    seoH2: 'Como passar de um PDF a diapositivos',
    seoP1: 'Carregue o PDF. Cada página torna-se um diapositivo num ficheiro PPTX que pode anotar ou projetar.',
    seoP2: 'Serve para levar um dossiê, um guião ou uma proposta para uma reunião.',
    seoP3: 'O PDF original não fica guardado. A apresentação fica disponível para transferir e depois é apagada. O uso ocasional não exige conta.'
  },
  unlock: {
    seoTitle: 'Desbloquear PDF | One2PDF',
    seoDescription: 'Retire a palavra-passe de abertura de um PDF se já a conhecer. Não abre ficheiros cuja chave desconhece.',
    seoH2: 'Como desbloquear um PDF seu',
    seoP1: 'Introduza a palavra-passe atual. O resultado abre depois sem pedido.',
    seoP2: 'O One2PDF não descobre palavras-passe desconhecidas. Só documentos cuja chave possui.',
    seoP3: 'O original não fica no servidor. O PDF desbloqueado é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  ocr: {
    seoTitle: 'Reconhecer texto num PDF digitalizado | One2PDF',
    seoDescription: 'Reconheça o texto de uma digitalização e transfira um PDF selecionável. O OCR está no Passe de 7 dias ou no Pro.',
    seoH2: 'Como tornar uma digitalização pesquisável',
    seoP1: 'Carregue a digitalização e inicie o reconhecimento. O resultado é um PDF cujo texto se pode selecionar, procurar ou reutilizar. O OCR usa Tesseract e está incluído no Passe de 7 dias ou no Pro.',
    seoP2: 'A qualidade depende da nitidez da digitalização. Depois pode extrair, traduzir ou resumir o texto.',
    seoP3: 'O original não fica guardado. O PDF com OCR fica disponível para transferir e depois é apagado. O uso ocasional das outras ferramentas não exige conta; o OCR em si pede Passe ou Pro.'
  },
  translate: {
    seoTitle: 'Traduzir PDF e manter a disposição | One2PDF',
    seoDescription: 'Traduza o texto de um PDF e deixe-o nas zonas originais. Dois modos: conservar a disposição ou só o texto. Usa créditos de IA.',
    seoH2: 'Como traduzir um PDF sem o recompor',
    seoP1: 'O One2PDF traduz o texto e volta a colocá-lo nas zonas originais. Imagens, logótipos e tabelas ficam. Escolha a língua de origem, a língua de destino e depois conservar a disposição ou só texto.',
    seoP2: 'A disposição não é idêntica ao pixel: algumas línguas ficam mais longas ou mais curtas. O tamanho da letra ajusta-se dentro do limite. Uma digitalização com pouco texto selecionável passa primeiro por OCR.',
    seoP3: 'O original não fica guardado. O PDF traduzido é apagado depois da transferência. A tradução linguística usa um fornecedor de IA só se iniciar esta ferramenta. Conta 1 crédito por página tratada.',
    howTitle: 'Traduzir um PDF',
    howSteps: [
      'Carregue o PDF',
      'Escolha a língua de origem, a de destino e o modo de saída',
      'Transfira o PDF traduzido'
    ],
    faqTitle: 'Perguntas sobre traduzir PDF',
    faq: [
      {
        question: 'A disposição fica igual?',
        answer: 'Tanto quanto possível: imagens, logótipos e zonas de texto mantêm-se. Uma tradução mais longa pode reduzir um pouco a letra na caixa, sem a tornar ilegível.'
      },
      {
        question: 'Recebo um PDF ou um ficheiro de texto?',
        answer: 'O resultado principal é um PDF traduzido. Há também um .txt. O modo só texto produz um PDF de conteúdo sem reconstruir o desenho original da página.'
      },
      {
        question: 'As digitalizações funcionam?',
        answer: 'Sim. Se houver pouco texto selecionável, o One2PDF faz primeiro OCR com Tesseract e depois traduz os blocos reconhecidos.'
      }
    ]
  },
  sign: {
    seoTitle: 'Assinar PDF online | One2PDF',
    seoDescription: 'Acrescente o nome, a data e um carimbo visível ao PDF e transfira o documento assinado. Sem imprimir.',
    seoH2: 'Como assinar um PDF no navegador',
    seoP1: 'Carregue o ficheiro, escreva o nome, escolha a posição do carimbo e transfira o documento assinado.',
    seoP2: 'A pré-visualização mostra nome, data e motivo na última página ou em todas, antes de exportar.',
    seoP3: 'O original não fica guardado. O PDF assinado é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  pageNumbers: {
    seoTitle: 'Numerar páginas de um PDF | One2PDF',
    seoDescription: 'Coloque 1, 1/12 ou Página 1 em cada folha. Escolha a posição e transfira o PDF numerado.',
    seoH2: 'Como numerar um PDF',
    seoP1: 'Escolha o formato e a posição. Os números são aplicados de uma vez a todas as páginas.',
    seoP2: 'A pré-visualização mostra o número em cima ou em baixo, à esquerda, ao centro ou à direita, antes de exportar.',
    seoP3: 'O original não fica guardado. O PDF numerado é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  crop: {
    seoTitle: 'Recortar PDF | One2PDF',
    seoDescription: 'Corte margens brancas ou bordos de uma digitalização em todas as páginas ao mesmo tempo. Sem programa.',
    seoH2: 'Como recortar um PDF',
    seoP1: 'Defina as margens. O mesmo recorte vale para todas as páginas. A zona clara fica; a escurecida é removida.',
    seoP2: 'Serve para uma digitalização do telemóvel com margem a mais ou um talão que ultrapassa a folha.',
    seoP3: 'O original não fica guardado. O PDF recortado é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  deletePages: {
    seoTitle: 'Apagar páginas de um PDF | One2PDF',
    seoDescription: 'Retire uma capa, uma folha em branco ou anexos a mais. Tem de ficar pelo menos uma página no documento.',
    seoH2: 'Como apagar páginas de um PDF',
    seoP1: 'Clique nas páginas que quer retirar e exporte o documento mais curto. Tem de ficar pelo menos uma página.',
    seoP2: 'A pré-visualização mostra cada folha antes de a remover. As páginas não escolhidas mantêm a ordem e o conteúdo.',
    seoP3: 'O original não fica guardado. O PDF limpo é apagado depois da transferência. O uso ocasional não exige conta.'
  },
  reorder: {
    seoTitle: 'Reordenar páginas de um PDF | One2PDF',
    seoDescription: 'Arraste as miniaturas para a ordem certa e transfira o PDF.',
    seoH2: 'Como pôr as páginas de um PDF na ordem certa',
    seoP1: 'Arraste as miniaturas e guarde a nova ordem. Só a sequência muda, não o conteúdo das páginas.',
    seoP2: 'Serve quando a capa ficou no meio ou uma digitalização baralhou as páginas.',
    seoP3: 'O original não fica guardado. O PDF reordenado é apagado depois da transferência. O uso ocasional não exige conta.',
    howTitle: 'Reordenar páginas',
    howSteps: [
      'Carregue o PDF',
      'Arraste as miniaturas para a ordem certa',
      'Transfira o PDF atualizado'
    ],
    faqTitle: 'Perguntas sobre reordenar páginas',
    faq: [
      {
        question: 'Reordenar altera o conteúdo da página?',
        answer: 'Não. Só muda a ordem. Texto, imagens e qualidade mantêm-se.'
      },
      {
        question: 'Posso mover uma só página?',
        answer: 'Sim. Arraste a miniatura para o sítio certo e guarde.'
      },
      {
        question: 'O ficheiro fica guardado?',
        answer: 'Não. O original é apagado no fim do processamento. O resultado desaparece após a transferência ou no máximo em 15 minutos.'
      }
    ]
  },
  toPng: {
    seoTitle: 'Converter PDF para PNG | One2PDF',
    seoDescription: 'Exporte cada página de um PDF como PNG nítido. Várias páginas vêm num ZIP.',
    seoH2: 'Como converter um PDF para PNG',
    seoP1: 'Cada página torna-se um PNG, adequado para a web e para o ecrã. Várias páginas agrupam-se num arquivo.',
    seoP2: 'O PNG mantém gráficos planos mais nítidos do que um JPG muito comprimido.',
    seoP3: 'O PDF de origem é processado e depois apagado. O uso ocasional não exige conta.',
    howTitle: 'Converter PDF para PNG',
    howSteps: [
      'Carregue o PDF',
      'Inicie a conversão',
      'Transfira os ficheiros PNG'
    ],
    faqTitle: 'Perguntas sobre PDF para PNG',
    faq: [
      {
        question: 'Recebo um ficheiro ou vários?',
        answer: 'Uma página torna-se um PNG. Várias páginas vêm juntas num ZIP.'
      },
      {
        question: 'Para que serve o PNG?',
        answer: 'Para áreas nítidas, texto e capturas de ecrã. Para fotos, o JPG costuma ser mais pequeno.'
      },
      {
        question: 'O PDF fica guardado?',
        answer: 'Não. Só é processado para a conversão e depois apagado.'
      }
    ]
  },
  toText: {
    seoTitle: 'Extrair texto de um PDF | One2PDF',
    seoDescription: 'Passe o texto selecionável de um PDF para um ficheiro .txt. Se for uma digitalização, faça primeiro o OCR.',
    seoH2: 'Como extrair texto de um PDF',
    seoP1: 'A ferramenta lê a camada de texto e guarda o conteúdo como .txt. Pode colá-lo, pesquisá-lo ou reescrevê-lo.',
    seoP2: 'Uma digitalização sem camada de texto devolve pouco. Faça primeiro OCR se o texto for só uma imagem.',
    seoP3: 'O PDF não fica guardado. Transfira o ficheiro de texto se quiser conservá-lo. O uso ocasional não exige conta.',
    howTitle: 'Extrair texto de um PDF',
    howSteps: [
      'Carregue o PDF com texto selecionável',
      'Inicie a extração',
      'Transfira o ficheiro .txt'
    ],
    faqTitle: 'Perguntas sobre extração de texto',
    faq: [
      {
        question: 'Funciona numa digitalização?',
        answer: 'Só se o texto já for selecionável. Caso contrário, use primeiro o OCR.'
      },
      {
        question: 'Que formato recebo?',
        answer: 'Um ficheiro .txt simples, sem a disposição original.'
      },
      {
        question: 'O conteúdo fica guardado?',
        answer: 'Não. O processamento é temporário. Transfira o ficheiro se quiser conservá-lo.'
      }
    ]
  },
  summarize: {
    seoTitle: 'Resumir PDF | One2PDF',
    seoDescription: 'Obtenha um resumo curto, detalhado ou por pontos. Usa créditos de IA: 1 crédito por página.',
    seoH2: 'Como resumir um PDF',
    seoP1: 'Escolha o estilo e a língua do resumo. Conta 1 crédito de IA por página, no máximo 20 créditos por ficheiro. PDF mais longos são cortados antes do modelo.',
    seoP2: 'Uma digitalização precisa primeiro de uma camada de texto. Faça OCR se nada for selecionável.',
    seoP3: 'O original não fica guardado. Pode copiar o resumo ou transferi-lo como .txt. Um processo falhado não fica com os créditos.',
    howTitle: 'Resumir um PDF',
    howSteps: [
      'Carregue o PDF',
      'Escolha o estilo e a língua',
      'Copie ou transfira o resumo'
    ],
    faqTitle: 'Perguntas sobre resumir PDF',
    faq: [
      {
        question: 'Como se calculam os créditos de IA?',
        answer: '1 crédito por página, no máximo 20 créditos por ficheiro. Documentos mais longos são cortados antes do resumo. Um processo falhado não consome os créditos.'
      },
      {
        question: 'Que estilos existem?',
        answer: 'Curto, detalhado ou pontos-chave. A língua do resumo pode ser diferente da do documento.'
      },
      {
        question: 'Funciona numa digitalização?',
        answer: 'Só com camada de texto. Faça primeiro OCR se o PDF for só uma imagem.'
      }
    ]
  },
  htmlPdf: {
    seoTitle: 'Converter HTML para PDF | One2PDF',
    seoDescription: 'Passe uma página HTML ou código colado a PDF. HTML muito dinâmico reproduz-se pior do que HTML simples.',
    seoH2: 'Como converter HTML para PDF',
    seoP1: 'Carregue um ficheiro .html ou cole o código. A conversão corre no servidor.',
    seoP2: 'HTML simples fica bem representado. Páginas com muito JavaScript podem sair incompletas.',
    seoP3: 'O HTML não fica guardado. O PDF é apagado depois da transferência. O uso ocasional não exige conta.',
    howTitle: 'Converter HTML para PDF',
    howSteps: [
      'Carregue um ficheiro .html ou cole o HTML',
      'Inicie a conversão',
      'Transfira o PDF'
    ],
    faqTitle: 'Perguntas sobre HTML para PDF',
    faq: [
      {
        question: 'Posso colar HTML sem ficheiro?',
        answer: 'Sim. Cole o código na caixa e crie o PDF.'
      },
      {
        question: 'Páginas web complexas são suportadas?',
        answer: 'HTML simples fica bem representado. Páginas com muito JavaScript podem ficar incompletas.'
      },
      {
        question: 'Preciso de conta?',
        answer: 'Não para uso ocasional. O ficheiro e o resultado são temporários.'
      }
    ]
  }
} satisfies Record<string, PageSeoCopy>;

export const mergeSeoPt = {
  seoTitle: 'Juntar PDF online | One2PDF',
  seoDescription: 'Junte vários PDF num só documento, pela ordem das miniaturas. Sem instalar um programa.',
  seoH2: 'Como juntar vários PDF num só ficheiro',
  seoP1: 'Carregue pelo menos dois PDF, arraste as miniaturas para a ordem certa e junte-os. Em poucos segundos tem um documento para transferir.',
  seoP2: 'As páginas mantêm-se como estão, sem marca de água. Se precisar, pode numerá-las depois com a ferramenta de números de página.',
  seoP3: 'Os originais não ficam guardados. O PDF junto é apagado depois da transferência. Sem transferência, o One2PDF remove-o no máximo em 15 minutos. O uso ocasional não exige conta.',
  howTitle: 'Juntar ficheiros PDF',
  howSteps: [
    'Escolha os PDF que quer juntar',
    'Ponha-os na ordem de que precisa',
    'Transfira o PDF junto'
  ],
  faqTitle: 'Perguntas sobre juntar PDF',
  faq: [
    {
      question: 'Quantos PDF posso juntar de uma vez?',
      answer: 'Pode acrescentar vários PDF e reordená-los pelas miniaturas. O plano gratuito tem um limite diário de documentos e 20 MB por ficheiro. O Pro desbloqueia o processamento em lote e ficheiros maiores.'
    },
    {
      question: 'Preciso de conta para juntar PDF?',
      answer: 'Não. O uso gratuito não pede nome nem e-mail. Escolha a ferramenta, carregue os ficheiros e transfira o resultado.'
    },
    {
      question: 'Os PDF originais ficam guardados?',
      answer: 'Não. Os originais são apagados no fim. O ficheiro junto desaparece após a transferência, ou no máximo em 15 minutos se não o transferir.'
    }
  ]
} satisfies PageSeoCopy;

export const splitSeoPt = {
  seoTitle: 'Dividir PDF online | One2PDF',
  seoDescription: 'Extraia páginas ou separe cada folha no seu próprio PDF, dentro de um ZIP. Sem instalar um programa.',
  seoH2: 'Como dividir um PDF',
  seoP1: 'Carregue o ficheiro e escolha as páginas com um clique ou com um intervalo como 1-3, 5, 8. Depois inicie a operação.',
  seoP2: 'Extrair reúne as páginas escolhidas num PDF mais curto. Separar exporta cada página como ficheiro próprio, num ZIP.',
  seoP3: 'O original não fica guardado. O resultado é apagado depois da transferência. O uso ocasional não exige conta.',
  howTitle: 'Dividir um PDF',
  howSteps: [
    'Carregue o PDF',
    'Selecione as páginas para extrair ou separar',
    'Transfira o resultado'
  ],
  faqTitle: 'Perguntas sobre dividir PDF',
  faq: [
    {
      question: 'Posso dividir um PDF em vários ficheiros?',
      answer: 'Sim. Separar exporta cada página como PDF próprio, num ZIP. Para ficar com algumas páginas num só documento, use Extrair.'
    },
    {
      question: 'Dividir um PDF é grátis?',
      answer: 'Sim, sem conta para uso ocasional. O plano gratuito permite 5 documentos por dia e ficheiros até 20 MB.'
    },
    {
      question: 'O original fica guardado?',
      answer: 'Não. É apagado no fim do processamento. O resultado desaparece após a transferência ou no máximo em 15 minutos.'
    }
  ]
} satisfies PageSeoCopy;

export const compressSeoPt = {
  seoTitle: 'Comprimir PDF online | One2PDF',
  seoDescription: 'Reduza o peso de um PDF demasiado grande e transfira um ficheiro mais leve, ainda legível. Sem instalar um programa.',
  seoH2: 'Como comprimir um PDF',
  seoP1: 'Carregue o ficheiro, escolha um nível (alto, médio ou forte) e inicie a compressão. Em poucos segundos tem um PDF mais pequeno para transferir.',
  seoP2: 'Alto conserva o texto. Médio e forte reduzem mais as imagens: o texto deixa de ser selecionável porque as páginas passam a imagem. Útil quando o Gmail, o Outlook ou um formulário recusam um anexo.',
  seoP3: 'O original não fica guardado. O resultado é transferido e depois apagado. Sem transferência, o One2PDF remove-o no máximo em 15 minutos. O uso ocasional não exige conta.',
  howTitle: 'Comprimir um PDF',
  howSteps: [
    'Carregue o PDF que pesa demasiado',
    'Escolha um nível de compressão',
    'Transfira o ficheiro mais leve'
  ],
  faqTitle: 'Perguntas sobre comprimir PDF',
  faq: [
    {
      question: 'Como comprimir um PDF demasiado grande para o e-mail?',
      answer: 'O Gmail e o Outlook recusam muitas vezes anexos acima de 25 MB. No One2PDF, carregue o PDF, escolha um nível (alto, médio ou forte) e comprima. O ficheiro mais leve continua legível e, em geral, cabe no limite de envio.'
    },
    {
      question: 'Comprimir um PDF baixa a qualidade?',
      answer: 'Alto mantém o texto e as imagens o mais perto possível do original. Médio e forte reduzem mais as imagens e podem suavizar fotos ou digitalizações. O texto continua legível. Use alto para um currículo ou contrato e um nível mais forte se houver um limite de tamanho rigoroso.'
    },
    {
      question: 'O One2PDF guarda o meu ficheiro depois de comprimir?',
      answer: 'Não. O PDF é processado só durante a operação. O original é apagado; o resultado pode ser transferido uma vez e depois é removido. Ficheiros não transferidos desaparecem no máximo em 15 minutos. O uso ocasional não exige conta.'
    }
  ]
} satisfies PageSeoCopy;
