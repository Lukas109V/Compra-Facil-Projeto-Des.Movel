# Origem e adaptação do FilmesRequest

Em 07/11/2026, o código do [Snack público FilmesRequest](https://snack.expo.dev/@romualdomrc/filmesrequest) foi recuperado da estrutura `window.__INITIAL_DATA__` do HTML disponibilizado pela própria página, sem login, download autenticado ou execução desse código externo. Identificação do Snack: `6cbcd473-68e0-468d-a6f9-0a6baa674950`.

A base declara SDK **54.0.0**, nome **FilmesRequest** e descrição “Busca de filmes com a API do TMDB”. Contém seis arquivos: `App.js`, `styles.js`, `src/tmdb/defaults.js`, `queryString.js`, `searchWithFetch.js` e `searchWithAxios.js`. Suas dependências explícitas são `axios: *` e `expo-checkbox: ~5.0.8`.

O código original contém formulário de título, checkbox para selecionar axios, pesquisa `/search/movie`, ordenação decrescente por popularidade, limite de cinco filmes e poster/título na lista. Calcula `releaseDate`, mas não exibe ano. Não trata todas as falhas com `finally`, não exibe nota, não substitui poster ausente e não tem consulta de detalhes.

Esta entrega adapta aquela base para **Expo SDK 57**, alinhando React e React Native à versão do trabalho principal, mas mantendo manifesto, lockfile, comando de execução e dependências próprios. A entrada usa Expo Router conforme as convenções do repositório. Os detalhes usam um Modal do React Native; não há rota de filmes no Compra Fácil.

Foram preservados os nomes de entrada dos serviços fetch/axios, a escolha pelo checkbox, o endpoint de pesquisa, idioma `pt-BR`, filtro de conteúdo adulto desligado, ordenação e limite de cinco resultados. A lógica comum de consulta/normalização foi centralizada para que os dois modos tenham os mesmos contratos.

Foram acrescentados os requisitos do enunciado de 05/11: tratamento de erros com encerramento do carregamento, resultado vazio, ano, nota média, poster substituto e nova consulta de detalhes `/movie/{id}` com sinopse, duração, gêneros e data. Timeout e cancelamento impedem que consultas descartadas atualizem um Modal fechado.

A configuração de autenticação presente no exemplo não foi retida nem usada. A cópia local exige configuração própria via `.env.local`, fora do Git. O código-fonte bruto do HTML não é entregue; apenas esta adaptação sem credencial e os registros de procedência são versionados.

Implementação local e situação acadêmica são independentes. O anexo registra prazo expirado em 06/11/2026 às 23h59; não foi feita submissão ao AVA nem confirmada reabertura.
