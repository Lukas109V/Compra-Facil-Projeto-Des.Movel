# Plano de integração dos materiais de Desenvolvimento Móvel

O Compra Fácil já implementava listas de compras, IMC com Firebase e consulta ao World Bank. Este plano foi elaborado antes das integrações de Drawer, Styled Components e da atividade independente de filmes. A implementação foi autorizada em seguida; o andamento está registrado abaixo, e os resultados observados estão em [VALIDACAO.md](VALIDACAO.md).

Base analisada: `main`, commit `6082676347439f4d672c4112e03a1d29a2231077`, em 07/11/2026. O usuário orientou priorizar as partes citadas no arquivo e fornecer os acréscimos individuais do professor depois. Esses acréscimos ficam fora do planejamento detalhado atual.

### Andamento da implementação em 07/11/2026

| Etapa | Resultado |
| --- | --- |
| A — Matriz/base | Registrada e preservada; sem mudança nos contratos das compras, IMC ou Firestore |
| B — Drawer | Implementado com cinco destinos; URLs preservadas; formulários/detalhes continuam em Stack; validado no navegador |
| C — Styled Components | Implementado em UI.js e componentes próprios do IMC; aparência, campos e interações conferidos |
| D — Firebase/World Bank | Salvamento, histórico, exclusão, falha da API e retry sem duplicação validados pela interface Web; aparelho/gestos nativos pendentes |
| E — FilmesRequest | Aplicativo independente em `atividades/filmesrequest`, com manifesto e pacote próprios; 17 testes e bundles nas três plataformas; consulta real TMDB adiada pelo usuário |
| F — Entrega | Manual, roteiro e evidências atualizados; pacotes e conferência de reprodução registrados no relatório de implementação |

O destino de filmes foi ajustado de pasta irmã/Snack para uma subpasta com projeto independente no mesmo repositório, permitindo commits conjuntos sem acoplar rotas, banco ou dependências ao Compra Fácil. As referências do anexo na seção seguinte são locais ao workspace da análise e não são necessárias para executar os aplicativos.

## 1. Fontes e limites

- [Índice do material separado](../../materiais-academicos/2026-11-07/README.md): 22 arquivos extraídos, com os 21 hashes e tamanhos listados no inventário conferidos.
- [Guia do anexo](../../materiais-academicos/2026-11-07/Desenvolvimento_Movel/00_Guia_de_atividades.pdf): atividade de filmes na página 2; entrega final na página 3; atividades históricas nas páginas 4 a 7.
- [Enunciados por atividade](../../materiais-academicos/2026-11-07/Desenvolvimento_Movel/tarefas/): fontes dos requisitos da matriz abaixo. Os checklists editoriais do guia são sugestões, não requisitos adicionais do professor.
- Código, testes e histórico Git deste checkout: evidência do estado implementado.
- `docs/VALIDACAO.md`: registro de verificações anteriores; não equivale a uma nova execução da interface, Firebase ou dispositivos nesta análise.

Prazos e notas são os registrados no anexo em 07/11/2026, sem nova consulta ao AVA. Os horários do AVA não declaram fuso; não foram convertidos. Os projetos do Expo Snack são referências online cujos fontes não acompanham o pacote. A proposta original completa e os pedidos individuais da primeira apresentação não estão disponíveis; portanto, ainda não é possível afirmar aderência integral a esses itens.

## 2. Natureza e arquitetura do repositório

É uma aplicação acadêmica única, sem backend próprio no repositório, escrita majoritariamente em JavaScript. Usa Expo SDK 57 (`~57.0.31`), React Native `0.86.3`, React `19.2.3`, Expo Router e npm com `package-lock.json`. TypeScript faz a checagem dos arquivos JavaScript por `checkJs`; não há necessidade de migrar a linguagem para cumprir o anexo. Evidências: `package.json:5-43`, `tsconfig.json:3-10`.

| Camada | Implementação atual | Evidência |
| --- | --- | --- |
| Entrada e navegação | `index.js` inicia Expo Router; oito telas em Stack | `src/app/_layout.js:23-36` |
| Rotas | Arquivos pequenos em `src/app/` reexportam telas de `src/screens/` | `src/app/index.js:1`, `src/app/imc/index.js:1` |
| Interface | `Page`, `Button`, `Field`, `Empty`, tema e estilos compartilhados | `src/components/UI.js:12-81`, `src/theme.js:2-55` |
| Compras | Context + funções puras; listas e produtos em JSON no AsyncStorage | `src/context/ShoppingContext.js:50-96`, `src/utils/shopping.js` |
| Banco remoto | Firebase Authentication anônimo + Firestore Lite, registros de IMC por UID | `src/context/ImcContext.js:23-27`, `src/services/imc.js:13-44` |
| Serviço externo | Requisição fetch dos quatro indicadores World Bank, BRA/2022 | `src/services/worldBank.js:1-51` |
| Validação | Testes Node offline, ESLint e TypeScript; integração Firebase opcional e separada | `package.json:24-32`, `tests/` |

As listas são locais. O histórico de IMC é remoto e depende da identidade anônima persistida no aparelho. A consulta World Bank ocorre após confirmar o salvamento do IMC; sua falha permite repetir somente a consulta. Sexo e percentuais não são gravados no histórico, cujo contrato contém valor, peso, altura e data. Preservar esse contrato: o anexo não pede armazenar a comparação. Evidências: `src/services/firebaseAuth.native.js:4-12`, `src/screens/ImcScreen.js:59-84`, `src/services/imc.js:25-39`.

Não existe catálogo de filmes, Drawer ou uso de Styled Components no código atual. A componentização já existe; a lacuna explícita do desafio de componentes é a biblioteca solicitada. Também será necessário avaliar a decomposição dos blocos do IMC para atender ao pedido de criar o maior número possível de componentes úteis.

## 3. Alterações analisadas

O diretório de trabalho estava limpo antes desta tarefa: não havia diff local, staged ou arquivos não rastreados. Por isso, a análise de alterações usa a evolução commitada de `c7ca856` (base anterior à integração de IMC) até `6082676`, além da leitura dos arquivos atuais.

| Commit | Alteração observada | Consequência para o plano |
| --- | --- | --- |
| `0707a4e` e `c7ca856` | Aplicativo de compras e README inicial | Preservar os fluxos de listas e produtos |
| `b962518` | IMC, histórico, serviços Firebase, regras, testes e migração da navegação para Expo Router | Não recriar o IMC nem voltar à navegação manual |
| `1fcf588` | Configuração do Firebase e documentação de execução/validação real | Revalidar configuração e comportamento no aparelho da apresentação |
| `6082676` | World Bank por sexo, classificação, parser, testes e documentação | A tarefa histórica de API já tem implementação correspondente |

O último commit é de 30/10/2026. As referências locais apontavam `main` e `origin/main` para o mesmo commit; não houve fetch nem verificação do GitHub atual. A pasta irmã `CompraFacil-publicacao-20261024` contém um registro de encerramento de publicação, não outro checkout de código para integrar.

**Risco de entrega:** os ZIPs antigos `CompraFacil-IMC-codigo.zip`, `CompraFacil-IMC-Firebase.zip` e `CompraFacil-IMC-provisorio.zip`, na pasta superior, não contêm os arquivos World Bank/IMC population. Não devem representar a entrega final atual. O pacote final deverá ser produzido a partir da versão validada do projeto, com os arquivos de entrada e configuração necessários.

## 4. Matriz dos requisitos do anexo

| Atividade | Situação registrada no anexo | Estado no código | Encaminhamento |
| --- | --- | --- | --- |
| Aula 05/11: FilmesRequest | Prazo 06/11 às 23h59; 6 pontos; 0/11 tentativas | Ausente; não há axios no manifesto principal | Implementar os requisitos de filmes na base indicada, como entrega própria; regularização do prazo é questão acadêmica separada |
| Entrega final | Prazo 18/11 às 23h59; 50 pontos; 0/1 tentativa | Base funcional, banco e serviço Web implementados; documentação existente | Integrar competências faltantes, validar no dispositivo, finalizar manual e apresentação; pedidos individuais ficam para depois |
| Telas e componentes | Prazo 21/10; 20/20; 1/11 tentativas | Oito telas e componentes reutilizáveis | Preservar e verificar regressões; não presumir reenvio |
| API de 29/10 | Enviada em 30/10; 6/6; 1/1 tentativa | World Bank por sexo, quatro indicadores e comparação já implementados | Manter e demonstrar; não adicionar axios a este serviço, pois a tarefa permite fetch OU axios |
| IMC com Firebase | Prazo 23/10; 0/5; tentativa não finalizada | Cálculo, valor/data no Firestore, tela de histórico e exclusão opcional implementados | Validar persistência; implementação não comprova regularização da submissão antiga |
| React Navigation | Prazo 24/09; 0/3; tentativa não finalizada | Stack com mais de três telas, mas sem Drawer | Planejar Drawer com ao menos três destinos; Stack sozinho não satisfaz o desafio histórico |
| Componentes e Styled Components | Prazo 16/09; 0/3; tentativa não finalizada | Componentes reutilizáveis, mas estilos via StyleSheet/objetos e sem styled-components | Integrar Styled Components de forma focada, sobretudo campos e resultado do IMC |

`CONFLITO: nota 20/20 vs tentativa não finalizada` em Telas e Componentes. Ambos os registros constam no anexo. Não deduzir pendência de código nem necessidade de novo envio a partir dessa divergência.

A redação da entrega final pede as funcionalidades das aulas e coerência com a proposta do grupo, mas não manda incorporar literalmente uma biblioteca de filmes ao aplicativo de compras. Este plano recomenda integrar Drawer e Styled Components ao Compra Fácil e manter FilmesRequest como atividade própria. É uma decisão de organização proposta para revisão; a exigência de colocar filmes dentro do Compra Fácil não está comprovada no anexo.

## 5. Trabalho proposto e ordem de execução

### Etapa A — Fixar a matriz e preservar a base

**Prioridade:** alta. **Esforço estimado:** pequeno. **Dependência:** nenhuma.

1. Ao iniciar a implementação, conferir o commit e `git status`; ajustar os caminhos deste plano se o projeto tiver mudado.
2. Usar as sete linhas da matriz como rastreabilidade. Manter um campo separado para os pedidos individuais que o usuário enviará depois.
3. Preservar contratos das compras, chave `@comprafacil:lists:v1`, caminhos do Firestore e regra de não duplicar gravação ao repetir apenas a consulta de percentuais.
4. Registrar que uma atividade implementada e uma avaliação entregue são estados diferentes. Nenhum trabalho local autoriza envio ao AVA.

**Aceite:** todos os itens explícitos têm destino e critério de verificação; nenhum requisito novo é inferido de exemplos de login, sensores ou PDFs conceituais.

### Etapa B — Drawer no Compra Fácil

**Prioridade:** alta para cobrir a lacuna de navegação do anexo. **Esforço:** médio. **Depende de:** A.

**Arquivos previstos:** `src/app/_layout.js` e, se necessário para aninhar os navegadores, layouts/grupos de rotas sob `src/app/`; ajustes focados nos acessos de `src/screens/MainScreens.js`; manifesto/lockfile apenas para dependências realmente necessárias.

1. Manter Expo Router. Usar o Drawer compatível com o SDK 57, com no mínimo Início, Minhas listas e IMC; Sobre e Histórico podem ser destinos adicionais.
2. Preservar Stack para formulários e detalhes, incluindo IDs de lista/produto, botão voltar e URLs públicas atuais. Grupos de rotas podem organizar esse aninhamento sem alterar URLs; evitar dois cabeçalhos visíveis para a mesma tela.
3. Manter `ShoppingProvider`, `ImcProvider` e `SafeAreaProvider` acima da navegação para que trocar de seção não recrie estado/sessão.
4. Conferir as dependências nativas pela documentação do SDK e pelo manifesto. Reanimated e Worklets já estão declarados. Gesture Handler existe em `node_modules` por dependência transitiva, mas não está declarado diretamente pelo aplicativo; se for importado/necessário, declarar a dependência compatível via Expo. Não instalar `@react-navigation/drawer` por seguir exemplos antigos automaticamente: no SDK 56+ o Drawer está incluído no Expo Router.
5. Conferir se o Drawer do Router atende à comprovação pedagógica do desafio denominado React Navigation. O código instalado usa a implementação distribuída pelo Router; se a correção exigir expressamente uma dependência/importação direta diferente, registrar essa restrição antes de substituir a arquitetura.

Referências conferidas: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Drawer no Expo Router](https://docs.expo.dev/router/advanced/drawer/); `node_modules/expo-router/drawer.js:1` e `node_modules/expo-router/build/layouts/Drawer.js:10-25`.

**Aceite:** menu abre/fecha pelo botão e pelo gesto onde suportado; pelo menos três telas acessíveis; voltar do produto/detalhes funciona; listas e sessão IMC não reiniciam ao trocar de seção; URLs atuais abrem; navegação sem erros de console em web e no dispositivo móvel escolhido.

### Etapa C — Componentes do IMC com Styled Components

**Prioridade:** alta para cobrir a lacuna explícita de estilos. **Esforço:** médio. **Depende de:** A; executar depois de B para evitar alterações simultâneas na estrutura compartilhada.

**Arquivos previstos:** `src/components/UI.js`, novo componente de resultado do IMC em `src/components/`, `src/screens/ImcScreen.js`, eventualmente `src/screens/ImcHistoryScreen.js`, `src/theme.js`, `package.json` e lockfile.

1. Planejar uma versão estável de `styled-components` compatível com o React instalado, usando a entrada `styled-components/native`; a biblioteca não está instalada hoje. Usar o comando de instalação indicado pelo `AGENTS.md` e revisar a alteração do lockfile.
2. O enunciado pede o maior número possível de componentes e Styled Components sempre que possível; campo e resultado são exemplos, não a lista completa. Mapear os blocos do IMC: rótulo + entrada, botão, resultado/classificação, seleção de sexo, comparação populacional e estados de carregamento/erro. Avaliar também o cartão do histórico. Evoluir os componentes existentes e extrair responsabilidades úteis, sem duplicar uma segunda família de campos e botões.
3. Reutilizar `colors` e medidas existentes de `src/theme.js`, preservando aparência, acessibilidade, erro, disabled, feedback de toque e uso de teclado decimal.
4. Extrair da tela o resultado e, se facilitar a leitura, o bloco de comparação. A tela continua responsável pela coordenação do estado e das chamadas; os componentes recebem dados e callbacks.
5. Usar Styled Components nos blocos do IMC sempre que tecnicamente possível e registrar a justificativa dos estilos/componentes mantidos fora dessa abordagem. A decomposição deve manter responsabilidades compreensíveis; não exige reescrever telas de compras alheias ao exercício de IMC. Não alterar fórmulas, limites, persistência ou identidade do usuário para atender ao exercício visual.

Referência: [React Native no Styled Components](https://styled-components.com/docs/basics#react-native). Confirmar a versão estável na execução; não selecionar uma versão alpha por padrão.

**Aceite:** mapa dos blocos do IMC com componentes extraídos e justificativas para os que permanecerem na tela; uso real de Styled Components sempre que possível, com exceções justificadas; campos e resultado reutilizáveis; aparência e interação preservadas; mensagens e estados de carregamento/falha continuam visíveis; lint, typecheck e testes passam.

### Etapa D — Validar as integrações que já existem

**Prioridade:** alta, pois banco e serviço Web somam 20 pontos da final. **Esforço:** médio. **Depende de:** B e C para validar o estado final integrado.

**Arquivos em foco:** `src/screens/ImcScreen.js`, `src/screens/ImcHistoryScreen.js`, `src/context/ImcContext.js`, `src/services/imc.js`, `src/services/worldBank.js`, `src/utils/imcPopulation.js`, testes e `docs/VALIDACAO.md`.

1. Manter o fluxo de gravação no Firebase com valor e data do servidor, histórico em ordem decrescente e exclusão com confirmação.
2. Demonstrar retorno do histórico após fechar/reabrir o aplicativo, preservando a identidade anônima. Não prometer recuperação após limpar os dados do aparelho.
3. Demonstrar World Bank por sexo com os quatro indicadores de 2022. Manter `100 - sobrepeso`, `sobrepeso - obesidade` e `obesidade`, pois sobrepeso já inclui obesidade; manter o aviso de que abaixo de 25 inclui baixo peso e faixa normal.
4. Validar falha da API na interface: mensagem, fim do carregamento e nova consulta que não gera outro registro Firebase. Os testes existentes cobrem erros, timeout e cancelamento do serviço World Bank; não executam a tela nem comprovam o retry da interface sem nova gravação. A reprodução visual da falha também está pendente no registro anterior.
5. Validar falha de conexão com o Firebase sem confirmação falsa de salvamento. Não trocar dados reais por percentuais fixos para fazer a demonstração passar.
6. Acrescentar testes somente para comportamentos novos ou falhas reproduzidas. Usar os testes existentes como padrão, sem criar nova infraestrutura de teste sem necessidade.

**Aceite:** Firebase e API demonstrados no aparelho selecionado, com evidência de sucesso e erro; compras locais continuam persistindo. O teste que escreve no Firebase real só deverá ser executado no ambiente autorizado para teste. Esta análise não o executou.

### Etapa E — Atividade de filmes em entrega própria

**Prioridade:** preparar em paralelo ao Compra Fácil, sem assumir que o prazo expirado será reaberto. **Esforço:** médio. **Depende de:** recuperar o projeto-base, ausente do ZIP. Pode avançar independentemente de B e C.

**Destino proposto:** pasta irmã do Compra Fácil, `atividades/filmesrequest/`, ou cópia própria do Snack, preservando sua identificação como Aula 05 de Novembro. Não criar esse projeto até iniciar a implementação. Se for solicitado posteriormente exibir filmes dentro do Compra Fácil, revisar esse destino e planejar a rota explicitamente.

1. Recuperar e inspecionar [FilmesRequest do professor](https://snack.expo.dev/@romualdomrc/filmesrequest). Registrar arquivos, dependências, SDK, endpoint-base e método de autenticação realmente usados; não presumir que o pacote contém esse código ou que o endpoint funciona sem configuração.
2. Nas buscas, implementar `try/catch/finally` em ambos os modos: fetch e axios. Distinguir falha de rede/HTTP de lista sem resultados; mostrar mensagem e liberar o botão em todos os caminhos.
3. Na lista, mostrar ano de `releaseDate`, nota `vote_average` e imagem substituta quando não houver poster. Não tratar nota zero como ausência de nota.
4. Ao tocar no filme, abrir tela ou Modal e realizar uma nova requisição `/movie/{id}`. Mostrar sinopse, duração, gêneros e data de lançamento; o cliente HTTP deve seguir o checkbox fetch/axios também nos detalhes.
5. Conferir tratamento de status HTTP nos dois clientes, cujos comportamentos diferem. Compartilhar formatação/normalização quando útil, mantendo os dois modos reais.
6. Usar a configuração exigida pelo exemplo sem registrar tokens privados no código, logs ou pacote. Dependências como axios pertencem a esta atividade; não adicioná-las ao serviço World Bank do Compra Fácil sem necessidade.

**Matriz mínima de aceite, executada em cada modo:** busca com resultado; busca vazia com “Nenhum filme encontrado”; falha HTTP/rede com mensagem e botão liberado; filme sem poster; ano/nota visíveis; toque gera a requisição de detalhes e apresenta os quatro campos; falha de detalhes permite fechar/repetir sem travar. Registrar separadamente testes simulados e chamada real.

A implementação desta atividade não regulariza automaticamente sua avaliação no AVA. Verificar a possibilidade de entrega atrasada antes de qualquer submissão; não confundir isso com permissão para preparar o código local.

### Etapa F — Manual, apresentação e pacote final

**Prioridade:** alta. **Esforço:** médio. **Depende de:** B, C e D para o Compra Fácil; E tem pacote próprio.

**Arquivos previstos:** `README.md`, novo `docs/MANUAL_USUARIO.md` se tornar a consulta mais clara, `docs/APRESENTACAO.md`, `docs/VALIDACAO.md` e imagens de evidência pertinentes.

1. Aproveitar o README e o roteiro existentes. Consolidar instruções de instalação e uso de cada funcionalidade, navegação pelo Drawer, entradas válidas, erros, armazenamento local/remoto e dependência de internet.
2. Incluir capturas atuais do app no dispositivo escolhido e exemplos reproduzíveis. Distinguir limite do produto de falha: listas não sincronizam; a sessão é anônima; não há fila offline para o IMC.
3. Atualizar o roteiro para demonstrar compras, componentes, Drawer, persistência, IMC e World Bank. Preparar o ambiente e ensaiar com os integrantes; a ausência de apresentação implica nota zero conforme o enunciado.
4. Gerar um novo pacote a partir da versão efetivamente validada, incluindo `package.json`, lockfile, `App.js`, `index.js`, `app.json`, `src`, assets e documentação/configurações necessárias. Excluir dependências instaladas, caches, `.git`, credenciais privadas e ambiente local; fornecer `.env.example` com configuração de cliente apropriada.
5. Testar o pacote em uma pasta limpa com as dependências declaradas, seguir o manual e confirmar execução. Como alternativa de entrega, conferir as regras vigentes para uso do link do repositório; não presumir que a regra da primeira etapa substitui a orientação da final.
6. O guia registra limite de 150 MB por arquivo no AVA na consulta de 07/11. Conferir o limite vigente antes do envio. Não anexar os PDFs conceituais e materiais auxiliares ao código por padrão.

**Aceite:** uma pessoa consegue executar e usar as funções pelo manual; pacote reproduz o estado validado; roteiro cobre os critérios; todos os testes e limites reais estão registrados. Publicação, push e envio ao AVA são etapas posteriores à preparação local.

## 6. Verificações e critérios de conclusão

Verificações executadas nesta análise, sem alterar código ou dependências:

| Verificação | Resultado atual |
| --- | --- |
| `npm test` | 14 testes passaram; avisos `MODULE_TYPELESS_PACKAGE_JSON` do Node, sem falhas |
| `npm run lint -- --no-cache` | Passou, sem erros ou avisos de código |
| `npm run typecheck` | Passou |
| Inventário do anexo | 21 arquivos conferidos; 22 extraídos, contando o próprio inventário |
| Interface, API real, Firebase real e aparelho/emulador | Não executados nesta análise; os resultados de outubro são históricos |

Na implementação, repetir os três comandos locais após cada etapa afetada. Para o estado integrado, gerar os bundles com `npx expo export --platform all --clear` e verificar navegação, interação e console no navegador e no dispositivo de apresentação. Exportação bem-sucedida não substitui execução nativa.

`npm run test:firebase` escreve e remove contas/documentos descartáveis no serviço configurado. É uma verificação opcional de integração real, fora da análise atual e dependente de ambiente/autorização adequados; não faz parte de `npm test`.

Conclusão técnica das partes documentadas requer:

- [ ] Drawer com pelo menos três telas e preservação dos fluxos atuais.
- [ ] Componentes do IMC com uso real de Styled Components.
- [ ] Compras, Firebase e World Bank verificados no estado integrado e no dispositivo escolhido.
- [ ] FilmesRequest cobrindo os dois clientes e todos os critérios do enunciado, em sua entrega própria.
- [ ] Manual, roteiro e pacote final atualizados e reproduzíveis.
- [ ] Diff revisado; sem mudanças em fórmulas, dados existentes ou dependências fora do necessário.

A aderência aos pedidos individuais da primeira apresentação e a situação acadêmica das submissões permanecem pendentes para uma etapa posterior. Não marcar a entrega acadêmica inteira como concluída apenas porque os itens técnicos acima passaram.

## 7. Sequência sugerida até a entrega

Cronograma proposto, não um prazo adicional do professor nem uma automação:

| Período | Resultado esperado |
| --- | --- |
| 07–08/11 | Validar matriz, recuperar FilmesRequest e preparar a integração de Drawer |
| 09–11/11 | Drawer e Styled Components integrados; filmes pode avançar separadamente |
| 12–14/11 | Verificação de Firebase/API e fluxos no dispositivo; corrigir regressões encontradas |
| 15–17/11 | Manual, evidências, pacote limpo e ensaio da apresentação |
| 18/11 | Conferência final e envio conforme regras vigentes do AVA, antes do horário registrado de 23h59 |

Os acréscimos individuais que o usuário informar depois devem receber novas linhas na matriz e avaliação de impacto no cronograma; não podem ser considerados implementados antecipadamente.
