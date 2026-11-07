# Validação do FilmesRequest em 07/11/2026

## Verificações executadas

| Verificação | Resultado |
| --- | --- |
| `npm test` | 17 testes passaram, zero falhas; execução offline |
| `npm run lint -- --no-cache` | Passou, sem erros ou avisos no código |
| `npm run typecheck` | Passou, incluindo telas, componentes e serviços JavaScript |
| `npx expo install --check` | Passou: `Dependencies are up to date` |
| `npx expo export --platform all --clear --max-workers 2` | Passou: bundles web, Android e iOS gerados em `dist/` |
| Revisão independente do fluxo UI/serviço | Sem achados materiais no recorte dos requisitos da atividade |

As dependências nativas foram alinhadas ao SDK 57: Gesture Handler 2.32.0, Reanimated 4.5.1 e Worklets 0.10.1. A instalação inicial havia resolvido peers opcionais mais recentes; essas versões foram corrigidas antes da exportação final. O lockfile registra a árvore validada, com axios 1.21.0 e Expo Checkbox 57.0.0.

Os 17 testes cobrem os dois clientes de HTTP, busca e detalhes em requisições próprias, contrato de parâmetros/idioma, limite e ordenação sem mutar a resposta, nota zero, poster ausente, lista vazia, falhas HTTP/rede/JSON/contrato, timeout com nova tentativa, cancelamento externo, mudança do cliente, configuração ausente sem chamada e formatação de ano/data sem deslocamento de fuso.

Os testes usam fixtures sintéticas e clientes injetados. Não há dados simulados na interface nem requisições reais nos testes.

## Limites

- Não há chave real TMDB configurada nesta entrega. A consulta autenticada real, os resultados e o Modal com dados reais precisam ser conferidos com uma chave própria em `.env.local`.
- No navegador interno, o estado sem chave foi conferido nos modos fetch e axios: mensagem de configuração necessária, checkbox funcional e botão Pesquisar novamente habilitado. Não houve erros/warnings na amostra de console capturada. A consulta real TMDB foi adiada por decisão do usuário; resultados e Modal com dados reais não foram validados visualmente.
- Não houve execução em aparelho físico ou emulador Android/iOS nesta implementação. Os bundles nativos foram gerados, mas devem ser exercitados no dispositivo da apresentação.
- A instalação npm informou 14 vulnerabilidades na árvore de dependências (11 moderadas e 3 altas). Não foi aplicado `npm audit fix` nem atualização geral fora das versões necessárias à atividade.
- O bundler emitiu avisos sobre `NO_COLOR`/`FORCE_COLOR`; não impediram a exportação. Npm também informou uma resolução de extensão obsoleta no pacote Worklets durante a instalação, sem erro de build.
- Nenhuma submissão ao AVA ou publicação externa foi realizada.
