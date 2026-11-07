# FilmesRequest

Atividade independente de Desenvolvimento Móvel, baseada no [FilmesRequest do professor](https://snack.expo.dev/@romualdomrc/filmesrequest). Pesquisa filmes na API TMDB usando fetch ou axios, apresenta ano e nota e abre os detalhes em uma nova consulta. Não faz parte das telas ou do banco do Compra Fácil.

## Executar

Requer Node.js 24 LTS e npm. Abra um terminal nesta pasta:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

Em `.env.local`, preencha `EXPO_PUBLIC_TMDB_API_KEY` com sua própria chave de API do TMDB. A configuração pertence ao aplicativo cliente e será incluída no bundle Expo; não use credenciais administrativas. O exemplo do professor foi adaptado sem reter ou reutilizar sua chave.

```powershell
npm run web -- --port 8082
```

Para usar Expo Go em um dispositivo compatível com SDK 57, execute `npm start` e leia o QR code. O app precisa de internet e de uma chave TMDB válida. Alterou `.env.local`? Reinicie o servidor Expo. Os dados dos filmes são consultados na rede; não há resultados simulados no aplicativo.

## Usar

1. Digite o título de um filme.
2. Deixe **Usar axios** desmarcado para fetch, ou marque para axios.
3. Toque em **Pesquisar**. O botão fica desabilitado durante a consulta e é liberado após sucesso ou erro.
4. Confira até cinco resultados, ordenados por popularidade, com ano, nota média e poster. Sem imagem, o app usa um poster substituto local. Nota zero é exibida como `0,0 / 10`.
5. Toque em um filme. Uma nova requisição `/movie/{id}`, usando o modo selecionado, busca sinopse, duração, gêneros e data de lançamento. O Modal informa o cliente utilizado.
6. Feche o Modal ou repita a consulta se os detalhes falharem. É possível alternar o checkbox antes de abrir um detalhe para comparar os dois clientes.

Uma busca válida sem resultados mostra **Nenhum filme encontrado**. Falhas de rede, HTTP ou resposta inválida mostram erro, sem confundi-las com uma lista vazia. Se a chave não estiver configurada, a aplicação informa que a busca ainda precisa ser configurada e libera o botão.

## Verificar

```powershell
npm test
npm run lint -- --no-cache
npm run typecheck
npx expo export --platform all --clear
```

Os testes são offline, com clientes HTTP injetados e dados sintéticos restritos a `tests/`. Não utilizam chave real nem fazem requisições ao TMDB. Consulte [a validação registrada](VALIDACAO.md) para resultados e limitações.

## Organização

- `src/app/`: entrada e layout Expo Router; `App.js` reexporta o layout.
- `src/screens/MoviesScreen.js`: formulário, estado das consultas e `try/catch/finally` compartilhado pelos dois modos.
- `src/components/MoviePoster.js`: poster remoto com substituição local quando ausente ou com erro.
- `src/components/MovieDetails.js`: Modal de detalhes e repetição da consulta.
- `src/tmdb/client.js`: transportes fetch/axios, timeout, cancelamento e mensagens sem credenciais.
- `src/tmdb/searchWithFetch.js` e `searchWithAxios.js`: entradas preservadas da organização do exemplo.
- `src/tmdb/movies.js`: normalização e formatação; datas de lançamento não sofrem conversão de fuso.
- `assets/poster-placeholder.png`: substituto local criado para a atividade.
- [ORIGEM.md](ORIGEM.md): procedência do código e alterações em relação ao Snack.

## Referências

- [Pesquisa de filmes do TMDB](https://developer.themoviedb.org/reference/search-movie).
- [Detalhes do filme no TMDB](https://developer.themoviedb.org/reference/movie-details).
- [Tratamento de erros do axios](https://axios-http.com/docs/handling_errors).
- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/).

Dados e imagens pertencem ao TMDB e aos respectivos titulares. Este produto usa a API do TMDB e não é endossado ou certificado pelo TMDB.
