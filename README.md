# CompraFácil — Listas de compras e IMC

**Integrantes:** Lucas Gabriel Gomes Martins e Gabriel de Carvalho Souza

Aplicativo acadêmico em React Native com Expo Go. Organiza listas de compras e calcula o IMC. As listas ficam no aparelho via AsyncStorage; os cálculos de IMC são gravados no Cloud Firestore, com data e hora, e consultados em uma tela de histórico.

**Configuração pendente:** o código da integração está implementado, mas um projeto Firebase precisa ser conectado e configurado para calcular, salvar e consultar o IMC. Veja [Configurar o Firebase](docs/FIREBASE.md). O fluxo de listas funciona independentemente dessa configuração.

## Iniciar no VS Code

1. Instale o Node.js 24 LTS, disponível em https://nodejs.org/
2. Abra **Terminal > Novo Terminal** e execute:

```bash
npm ci
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
| Calculadora de IMC | Peso em kg, altura em metros, validação e gravação do valor no Firebase |
| Histórico de IMC | Valor, data, horário, medidas e exclusão individual com confirmação |
| Sobre | Objetivo, integrantes e explicação sobre armazenamento |

A navegação usa Expo Router, com rotas em `src/app/`, cabeçalho e botão de voltar. Cadastro e edição compartilham a tela Produto. Há uma lista de exemplo somente no primeiro acesso. Depois de excluir todas as listas, elas permanecem vazias até o usuário criar outra.

## Organização do código

- `index.js`: entrada do Expo Router; `App.js` reexporta o layout
- `src/app/_layout.js`: provedores e registro das rotas
- `src/screens/MainScreens.js`: início, listas, nova lista e sobre
- `src/screens/DetailsScreen.js`: itens, filtros, progresso e exclusão da lista
- `src/screens/ItemScreen.js`: formulário de cadastro e edição
- `src/components/UI.js`: botões, campos, página e mensagens de estado vazio
- `src/context/ShoppingContext.js`: estado compartilhado e persistência local
- `src/utils/shopping.js`: validação, cálculos e alterações imutáveis
- `src/screens/ImcScreen.js`: formulário e confirmação de salvamento do IMC
- `src/screens/ImcHistoryScreen.js`: consulta, atualização e exclusão do histórico
- `src/context/ImcContext.js`: sessão anônima persistente do Firebase Authentication
- `src/services/`: inicialização do Firebase e operações do histórico no Firestore
- `src/utils/imc.js`: validação, fórmula e formatação do IMC
- `firestore.rules`: isolamento por usuário e validação dos registros
- `.env.example`: variáveis de configuração do aplicativo Web do Firebase
- `src/theme.js`: cores, tamanhos e estilos reutilizáveis
- `tests/shopping.test.mjs`: verificações das regras de cálculo e alteração
- `tests/imc.test.mjs`: fórmula, arredondamento, entradas inválidas e data
- `docs/APRESENTACAO.md`: roteiro e explicação para a dupla

## Regras

Nome de lista e produto obrigatório, até 60 caracteres. Quantidade maior que zero e até 9999, incluindo frações. Preço não negativo até 999999; use zero quando desconhecido. Aceita vírgula ou ponto decimal, sem separador de milhar. Total = soma de quantidade × preço. O indicador conta produtos cadastrados, não soma unidades. Para compra por peso, informe kg e preço por kg. Editar um item preserva seu estado de comprado

As listas não são sincronizadas entre dispositivos. Limpar os dados do aplicativo/navegador apaga as listas e a sessão anônima que dá acesso ao histórico de IMC. Os documentos de IMC continuam no Firebase, mas a identificação anônima anterior não pode ser recuperada pela interface. Não há login compartilhado entre aparelhos.

## Cálculos de IMC

Na tela inicial, toque em **Calcular IMC**, informe peso e altura e escolha **Calcular e salvar**. Exemplo: 70 kg e 1,75 m resultam em **22,86**. Cada toque concluído grava um documento próprio, mesmo que as medidas sejam iguais às de outro cálculo. A confirmação só aparece após o Firebase aceitar a gravação. Sem conexão ou em caso de erro, o aplicativo informa a falha e permite tentar novamente, reutilizando o ID para não duplicar uma resposta perdida.

Em **Histórico de IMC**, os registros aparecem do mais recente para o mais antigo, com data e hora do servidor exibidas no fuso do dispositivo. **Atualizar histórico** consulta novamente o Firebase. **Excluir registro** pede confirmação e só remove o cartão depois de o servidor aceitar a exclusão. O fluxo de IMC exige internet e não mantém fila de gravações offline.

## Verificação local

```bash
npm test
npm run lint
npm run typecheck
npx expo export --platform all
```

Veja [docs/VALIDACAO.md](docs/VALIDACAO.md) para os resultados observados e as limitações da validação.


## Referências técnicas

- Expo: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Firebase com Expo: https://docs.expo.dev/guides/using-firebase/
- Cloud Firestore: https://firebase.google.com/docs/firestore
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
