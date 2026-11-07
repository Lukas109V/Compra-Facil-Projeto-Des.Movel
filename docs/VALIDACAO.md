# Validação — integração de IMC, 24/10/2026

## Verificações executadas

- `npm test`: **5 testes passaram**. Cobrem as regras anteriores de compras e os novos casos de IMC: fórmula, arredondamento, vírgula/ponto decimal, medidas inválidas, altura em centímetros e formatação de data e horário.
- `npm run lint`: passou, sem erros ou avisos no código final.
- `npm run typecheck`: passou com `checkJs`, incluindo o código JavaScript de telas, contexto e serviços.
- `npx expo install --check`: consulta online concluída; dependências compatíveis com o SDK Expo 57. O Expo foi alinhado ao patch 57.0.31, Reanimated 4.5.1 e Worklets 0.10.1.
- `npx expo export --platform all --clear`: bundles web, iOS e Android gerados, incluindo bytecode Hermes para os aplicativos nativos. Foi detectado cache de uma exportação web anterior sem ambiente; a limpeza corrigiu isso. A leitura dos três arquivos finais confirmou a presença do ID do projeto e do ID do aplicativo configurados. O ambiente restrito inicialmente impediu escrita de temporários; a exportação autorizada fora dessa restrição passou.
- Diff revisado e `git diff --check` sem erros de espaço em branco.

## Navegador

Servidor iniciado pelo script `npm run web -- --port 8081`, em `http://localhost:8081`.

- Página inicial abriu e mostrou os atalhos de IMC.
- Calculadora abriu, recebeu peso 70 e altura 1,75. Sem configuração Firebase, mostrou o aviso de serviço indisponível e manteve o salvamento desabilitado.
- Histórico abriu com aviso de indisponibilidade, sem apresentar erro de consulta como histórico vazio.
- Botão **Novo cálculo** retornou à calculadora; voltar dali retornou ao início. O teste detectou e corrigiu empilhamento desnecessário de telas nesse caminho.
- Fluxo anterior de listas abriu detalhes e edição com os IDs corretos.
- Quantidade do arroz de exemplo foi alterada de 1 para 2: total passou de R$ 44,60 para R$ 69,50. Após recarregar, quantidade e total permaneceram. O teste restaurou a quantidade 1 e confirmou o total original R$ 44,60.
- Console capturado desde o recarregamento inicial e consultado após as interações: nenhum erro ou aviso registrado nas amostras completas consultadas (limite de 100 entradas, sem truncamento observado).

## Firebase real

- O projeto `comprafacil-imc` foi criado na conta autenticada no Chrome após o próprio usuário aceitar os Termos do Firebase. Foi mantido o plano Spark, sem ativar serviços que exigem upgrade de faturamento.
- Firestore Standard `(default)` criado em São Paulo (`southamerica-east1`), região escolhida pelo usuário. Autenticação anônima habilitada, sem limpeza automática das contas.
- Aplicativo Web **CompraFacil Expo** registrado. Configuração pública do cliente disponível em `.env.example` para executar outros clones; `.env.local` permanece fora do Git. Nenhuma credencial de administração foi incluída.
- Regras locais publicadas pelo Console, após leitura de conferência do conteúdo do editor e confirmação de publicação pelo Firebase.
- `npm run test:firebase`: **9 testes passaram** (um agrupador e oito cenários). Verificou gravação com valor e timestamp do servidor, retry sem duplicatas, outro cálculo em ordem decrescente, bloqueio de leitura/listagem/gravação/exclusão por outro usuário, bloqueio sem autenticação, rejeição de campos/tipos/medidas/fórmula/data inválidos, proteção das medidas existentes e exclusão individual. Contas e documentos descartáveis foram removidos pelo script sem falhas de limpeza.
- No Chrome, a interface rejeitou campos vazios e altura 175; depois salvou 70 kg / 1,75 m e exibiu **22,86**. O histórico mostrou **24/10/2026, 00:19**. Ao recarregar a página, o registro permaneceu, comprovando a restauração da sessão anônima nesse navegador.
- Foi verificado o cancelamento da confirmação de exclusão pela interface; a exclusão real foi verificada pelo teste automatizado contra o serviço.
- O documento criado pela interface também foi conferido na sessão administrativa do Console: `value` 22.86, `weight` 70, `height` 1.75 e `calculatedAt` em 24/10/2026 às 00:19:32 (UTC-3).
- Os cenários de negação de acesso geraram os erros `permission-denied` esperados pelo SDK, e os testes confirmaram essas rejeições. Eles não representam falhas no fluxo normal do aplicativo.

## Limites

- Não houve execução em aparelho físico ou emulador Android/iOS. Geração de bundles não comprova comportamento nativo.
- O fluxo de IMC requer internet. Não há fila offline; uma falha não recebe confirmação de salvamento. Retry preserva o ID somente enquanto o formulário permanecer aberto e sem alterações.
- O gerenciador npm informou avisos de segurança na árvore de dependências. Não foi executado `npm audit fix` nem atualização geral fora da integração.

Antes da apresentação, execute o checklist de [FIREBASE.md](FIREBASE.md) no aparelho que será utilizado. Os testes de isolamento cobrem os cenários descritos, sem constituir uma auditoria exaustiva das regras.

## Integração World Bank — 30/10/2026

- Consulta HTTP real dos quatro indicadores BRA/2022, fonte 14: sobrepeso feminino 64,38%, masculino 61,42%; obesidade feminina 31,88%, masculina 24,16%. O próprio serviço `getBrazilImcStatistics` também foi executado contra a API real.
- `npm test`: **14 testes passaram**, incluindo nove novos testes de classificação, parcelas sem dupla contagem, parser com observações fora de ordem, dados inválidos/ausentes, contrato do `fetch`, erro HTTP/rede/JSON, prazo de 12 segundos e cancelamento.
- `npm run lint` e `npm run typecheck`: passaram na versão final, sem alterar dependências ou regras do Firebase.
- `npx expo export --platform all --clear`: bundles web, Android e iOS gerados com a integração do World Bank. A execução nativa em dispositivo continua não verificada.
- Chrome, em `http://127.0.0.1:8081/imc`: seleção de sexo obrigatória; 70 kg / 1,75 m mostrou IMC 22,86 e 38,58% para Masculino; o mesmo cálculo mostrou 35,62% para Feminino. Ambos explicaram que o grupo abaixo de 25 inclui baixo peso e faixa normal.
- 100 kg / 1,75 m, Feminino: IMC 32,65, obesidade, 31,88%. 119,99 kg / 2 m, Masculino: IMC exibido 30,00, classificação correta de sobrepeso pelo valor completo 29,9975, percentual 37,26% e explicação do arredondamento.
- A captura de rede do Chrome confirmou resposta HTTP 200 da requisição conjunta à API do World Bank. Os percentuais da interface coincidiram com a resposta real.
- Os quatro cálculos de demonstração apareceram no histórico com valor, medidas e data/hora. O formato dos documentos e as regras existentes do Firestore foram preservados. Os registros de demonstração permaneceram disponíveis nesse navegador.
- Em largura de 390 px, a página não apresentou excesso horizontal (`clientWidth` e `scrollWidth` iguais a 390); as duas opções de sexo ficaram dentro da área visível, com `aria-checked` correspondente à seleção. A dimensão de teste foi restaurada.
- Console capturado antes do recarregamento e consultado após os fluxos: nenhum erro do aplicativo nas amostras completas de até 100 entradas. Houve um aviso de desconexão do Metro durante o reinício intencional do servidor.
- O estado visual de falha da API e seu retry não foram reproduzidos no navegador: a tentativa de bloqueio pelo depurador não interrompeu as consultas. HTTP/rede/JSON inválido, timeout e cancelamento foram verificados nos testes automatizados do serviço. As configurações temporárias de rede/cache foram restauradas.
- Não houve execução em aparelho físico ou emulador Android/iOS nesta etapa.

## Drawer e Styled Components — 07/11/2026

### Código e verificações locais

- Drawer com cinco destinos em `src/app/(drawer)/_layout.js`; Stack raiz preserva nova lista, detalhes e produto. Provedores permanecem acima dos navegadores e URLs/IDs não mudaram.
- UI.js usa `styled-components/native`; Imc.js reúne cabeçalho, sexo, conexão, carregamento, resultado/classificação, comparação e cartão de histórico. Estado e chamadas permanecem nas telas; fórmulas, serviços e regras do banco não foram alterados.
- `npm test`: **14 testes passaram**. Avisos preexistentes `MODULE_TYPELESS_PACKAGE_JSON` do Node não causaram falhas.
- `npm run lint -- --no-cache`: passou. Após as correções finais, ESLint dos arquivos alterados passou novamente.
- `npm run typecheck`: passou, inclusive após a correção da navegação de retorno do histórico.
- `npx expo export --platform all --clear --output-dir .expo/integracao-20261107/export-final`: passou; bundles Web, Android e iOS gerados após as correções finais. O diretório de saída alternativo preservou `dist/` anterior, cuja substituição estava bloqueada pelo ambiente.
- Revisão independente encontrou e corrigiu o retorno **Novo cálculo**: `dismissTo` gerava uma ação de Stack que o Drawer não trata. `router.navigate("/imc")` foi confirmado na interface, preservando peso, altura e sexo preenchidos.
- O conversor de estilos exigia unidade no `lineHeight` dos componentes Styled. Subtitle, BodyText e ErrorText usam os valores do tema com `px`; os estilos nativos diretos permanecem numéricos.

### Navegador e integrações

- No Chrome, menu abriu e navegou; criação de lista e produto, validação de nome vazio e retorno aos detalhes funcionaram. Café de teste, quantidade 2 e preço 12,90, totalizou **R$ 25,80**, preservado após recarregar a URL de detalhes com listId.
- Cálculo sintético de 70 kg / 1,75 m, Masculino, exibiu **22,86**, confirmou gravação no Firebase e mostrou **38,58%** via World Bank. O histórico persistiu após recarregar.
- A conexão do navegador Chrome foi encerrada durante a sessão. A conferência final continuou no navegador interno, usando o bundle exportado e uma sessão própria, sem alterar dados preexistentes do usuário.
- No bundle final, ida ao histórico e retorno por **Novo cálculo** preservaram as entradas. O menu exibiu os cinco destinos e os rótulos acessíveis de abrir/fechar em português.
- World Bank bloqueado temporariamente pelo depurador: houve mensagem de falha, fim do carregamento e confirmação de que o cálculo permanecia salvo. Após remover o bloqueio, **Consultar percentuais novamente** retornou HTTP **200** e **38,58%**. O histórico mostrou **um único registro**, sem duplicação. Foram testados cancelar e confirmar a exclusão desse registro; a sessão terminou com histórico vazio.
- Em viewport de **390 × 844**, largura do documento e scrollWidth foram iguais a 390. Seletores, campos e botões ficaram dentro da área horizontal. A configuração de viewport e o bloqueio de rede foram restaurados.
- Console do bundle final, capturado antes dos fluxos e consultado depois: nenhuma entrada de erro ou warning na amostra completa de até 100 entradas. Esse resultado se refere à exportação de produção, não a uma auditoria de logs do serviço remoto.
- Evidências: [Drawer em largura de celular](evidencias/drawer-mobile.png), [formulário do IMC](evidencias/imc-mobile.png).

### FilmesRequest independente

- Projeto em `atividades/filmesrequest`, com manifesto e lockfile próprios; sem novas rotas de filmes no Compra Fácil. A origem pública do Snack e a adaptação de SDK 54 para 57 estão documentadas em `ORIGEM.md` da atividade.
- **17 testes offline**, lint, typecheck, compatibilidade Expo e exportação Web/Android/iOS passaram. Os testes cobrem os dois clientes, erros, vazio, ano, nota zero, poster ausente e nova requisição de detalhes.
- No navegador, a configuração ausente mostrou a mensagem apropriada e liberou **Pesquisar** tanto em fetch quanto em axios. O checkbox alternou corretamente. Console consultado sem erros ou warnings na amostra capturada.
- [Evidência da configuração pendente](evidencias/filmes-sem-configuracao.png). O usuário escolheu deixar a consulta TMDB real para depois; não foi reutilizada a chave do exemplo do professor. Resultados e Modal com dados reais permanecem não validados visualmente.

### Limitações e dados de demonstração

- Não houve execução em aparelho/emulador Android/iOS nem teste de gesto nativo. ADB não estava disponível no PATH ou no caminho padrão do SDK local. Os bundles nativos passaram, mas não substituem esse teste.
- `npm run test:firebase` não foi repetido: as mudanças não alteraram os serviços/regras, e salvamento/leitura/exclusão reais foram exercitados pela interface com dados sintéticos. Os cenários de isolamento documentados anteriormente não foram reexecutados.
- A sessão inicial do Chrome ficou com a lista local **Validação Drawer 07-11** (Café de teste) e um registro sintético de IMC às 18h22. A sessão final do navegador interno removeu apenas o próprio registro de retry. Não foi declarada limpeza dos dados da sessão Chrome após a conexão ser encerrada.
- A instalação principal informou 27 vulnerabilidades na árvore npm. Não foi aplicada correção geral ou atualização de SDK fora do escopo. O relatório próprio de filmes registra os avisos da sua árvore separada.
- Não houve publicação, push, envio ao AVA ou alteração de permissões/configuração remota.

### Reprodução dos pacotes em cópia limpa

- Os ZIPs de origem foram gerados do commit `0e18614` com `git -c core.autocrlf=false archive`, preservando os bytes dos blobs. Os **93 arquivos** do projeto completo e os **28 arquivos** da atividade separada coincidiram byte a byte com o Git; a atividade isolada coincidiu com a subárvore do pacote completo. Caminhos/CRC conferidos, sem `.env.local`, `.git`, `node_modules`, caches ou `dist` nos arquivos entregues.
- Extração em diretório novo sob `.expo/integracao-20261107/pacote-limpo/`. `npm ci` restaurou **923 pacotes**, exit 0, utilizando cache e temporários próprios da validação. A política padrão de scripts do npm foi mantida.
- Na extração limpa passaram **14/14 testes**, **typecheck**, **lint** e **exportação Web com dois workers** (1.321 módulos). Não foi criado `.env.local` nessa conferência, nem feitas consultas reais aos serviços. Para uso normal, seguir a cópia da configuração cliente descrita no manual.
- Fontes, manifestos e lockfiles permaneceram idênticos aos ZIPs após os comandos. Os resultados detalhados e logs foram preservados no diretório ignorado de validação.
- A última atualização do plano e deste registro é exclusivamente documental. Os pacotes finais foram regenerados após esse registro; seus hashes exatos constam em `entregas/2026-11-07/SHA256SUMS.txt` na pasta superior ao repositório. A integridade foi conferida novamente, sem repetir testes cujas fontes/dependências permaneceram iguais.
