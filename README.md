# CompraFácil — Primeira etapa

**Integrantes:** Lucas Gabriel Gomes Martins e Gabriel de Carvalho Souza

Aplicativo acadêmico de lista de compras em React Native com expogo O objetivo é organizar produtos, reduzir esquecimentos e acompanhar o custo estimado. Sem servidor, autenticação ou API externa. Os dados ficam no aparelho por meio do AsyncStorage; no navegador, ficam no armazenamento local daquele navegador

## Iniciar no VS Code

1. Instale o Node.js 24 LTS, disponível em https://nodejs.org/
2. Extraia o ZIP. No VS Code, escolha **Arquivo > Abrir Pasta** e abra a pasta `CompraFacil`, que contém `package.json`
3. Abra **Terminal > Novo Terminal** e execute:

```bash
npm install
npm run web
```

Qr code as vezes carrega infinitamente, usar esse comando sempre funciona

```bash
npx expo start --tunnel
```

## Telas e funções

| Tela | Funcionalidade |
| --- | --- |
| Início | Resumo de listas e produtos pendentes, atalhos |
| Minhas listas | Exibição das listas e acesso aos detalhes |
| Nova lista | Cadastro com validação de nome obrigatório |
| Detalhes | Total estimado, progresso, filtros, marcação e exclusão da lista |
| Produto | Cadastro, edição e exclusão; quantidade, preço e categoria |
| Sobre | Objetivo, integrantes e explicação sobre armazenamento |

A navegação usa React Navigation Native Stack, com cabeçalho e botão de voltar. Cadastro e edição compartilham a tela Produto. Há uma lista de exemplo somente no primeiro acesso. Depois de excluir todas as listas, elas permanecem vazias até o usuário criar outra

## Organização do código

- `App.js`: provedores e registro das seis rotas
- `src/screens/MainScreens.js`: início, listas, nova lista e sobre
- `src/screens/DetailsScreen.js`: itens, filtros, progresso e exclusão da lista
- `src/screens/ItemScreen.js`: formulário de cadastro e edição
- `src/components/UI.js`: botões, campos, página e mensagens de estado vazio
- `src/context/ShoppingContext.js`: estado compartilhado e persistência local
- `src/utils/shopping.js`: validação, cálculos e alterações imutáveis
- `src/theme.js`: cores, tamanhos e estilos reutilizáveis
- `tests/shopping.test.mjs`: verificações das regras de cálculo e alteração
- `docs/APRESENTACAO.md`: roteiro e explicação para a dupla

## Regras

Nome de lista e produto obrigatório, até 60 caracteres. Quantidade maior que zero e até 9999, incluindo frações. Preço não negativo até 999999; use zero quando desconhecido. Aceita vírgula ou ponto decimal, sem separador de milhar. Total = soma de quantidade × preço. O indicador conta produtos cadastrados, não soma unidades. Para compra por peso, informe kg e preço por kg. Editar um item preserva seu estado de comprado

Não existe sincronização entre dispositivos. Limpar os dados do aplicativo/navegador apaga as listas. Erros ao carregar ou gravar são informados na tela


## Referências técnicas

- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/docs/getting-started/
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
