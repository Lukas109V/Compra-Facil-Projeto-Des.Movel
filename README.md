# CompraFácil — Listas de compras e IMC

**Integrantes:** Lucas Gabriel Gomes Martins e Gabriel de Carvalho Souza

Aplicativo acadêmico em React Native com Expo Go. Organiza listas de compras e calcula o IMC. As listas ficam no aparelho via AsyncStorage; os cálculos de IMC são gravados no Cloud Firestore, com data e hora, e consultados em uma tela de histórico.

A calculadora consulta a API do World Bank com `fetch` e compara o resultado com percentuais de adultos brasileiros, por sexo, usando os quatro indicadores de 2022. Não exige chave de API adicional. Veja [a consulta e as fórmulas](docs/WORLDBANK.md).

**Firebase configurado:** projeto `comprafacil-imc`, Firestore Standard em São Paulo e autenticação anônima. O arquivo `.env.example` contém a configuração pública do cliente para executar o trabalho; basta copiá-lo para `.env.local`, ignorado pelo Git. Não é necessário acessar a conta Firebase do grupo. O salvamento e a consulta já foram verificados contra o serviço real. Para usar um projeto próprio, veja [Configurar o Firebase](docs/FIREBASE.md).

## Iniciar no VS Code

1. Instale o Node.js 24 LTS, disponível em https://nodejs.org/
2. Abra **Terminal > Novo Terminal** no diretório do projeto e execute no PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run web
```

Em macOS/Linux, use `cp .env.example .env.local` para copiar a configuração. Para abrir no celular com Expo Go, execute `npm start` e leia o QR code. Se a conexão pela rede local não funcionar, tente o túnel:

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
| Calculadora de IMC | Peso, altura, sexo, gravação no Firebase e comparação com a população brasileira via World Bank |
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
- `src/services/worldBank.js`: consulta com `fetch`, validação dos quatro indicadores e cancelamento por prazo
- `src/utils/imcPopulation.js`: classificação e comparação com as parcelas da população
- `firestore.rules`: isolamento por usuário e validação dos registros
- `.env.example`: variáveis de configuração do aplicativo Web do Firebase
- `.firebaserc` e `firebase.json`: projeto e região do banco utilizado
- `src/theme.js`: cores, tamanhos e estilos reutilizáveis
- `tests/shopping.test.mjs`: verificações das regras de cálculo e alteração
- `tests/imc.test.mjs`: fórmula, arredondamento, entradas inválidas e data
- `tests/imcPopulation.test.mjs` e `tests/worldBank.test.mjs`: faixas, percentuais, resposta da API e falhas de consulta
- `tests/firebase.integration.mjs`: testes opcionais contra o Firebase real, com dados descartáveis
- `docs/APRESENTACAO.md`: roteiro e explicação para a dupla

## Regras

Nome de lista e produto obrigatório, até 60 caracteres. Quantidade maior que zero e até 9999, incluindo frações. Preço não negativo até 999999; use zero quando desconhecido. Aceita vírgula ou ponto decimal, sem separador de milhar. Total = soma de quantidade × preço. O indicador conta produtos cadastrados, não soma unidades. Para compra por peso, informe kg e preço por kg. Editar um item preserva seu estado de comprado

As listas não são sincronizadas entre dispositivos. Limpar os dados do aplicativo/navegador apaga as listas e a sessão anônima que dá acesso ao histórico de IMC. Os documentos de IMC continuam no Firebase, mas a identificação anônima anterior não pode ser recuperada pela interface. Não há login compartilhado entre aparelhos.

## Cálculos de IMC

Na tela inicial, toque em **Calcular IMC**, informe peso e altura, selecione **Feminino** ou **Masculino** e escolha **Calcular e salvar**. Exemplo: 70 kg e 1,75 m resultam em **22,86**. Cada toque concluído grava um documento próprio, mesmo que as medidas sejam iguais às de outro cálculo. A confirmação só aparece após o Firebase aceitar a gravação. Sem conexão ou em caso de erro, o aplicativo informa a falha e permite tentar novamente, reutilizando o ID para não duplicar uma resposta perdida.

Após salvar, a tela mostra a classificação e consulta o percentual correspondente ao sexo selecionado. Se o World Bank falhar, o cálculo permanece salvo e **Consultar percentuais novamente** repete somente a consulta. O sexo e os percentuais são usados na tela atual; o formato dos documentos do histórico continua com valor, peso, altura e data.

O indicador de sobrepeso (IMC ≥ 25) já inclui obesidade (IMC ≥ 30). Para IMC entre 25 e 30, a parcela é `sobrepeso − obesidade`; abaixo de 25, é `100 − sobrepeso`. Esse último grupo inclui baixo peso e faixa normal: a API não permite separá-los. A classificação usa o IMC completo, antes do arredondamento para exibição.

Em **Histórico de IMC**, os registros aparecem do mais recente para o mais antigo, com data e hora do servidor exibidas no fuso do dispositivo. **Atualizar histórico** consulta novamente o Firebase. **Excluir registro** pede confirmação e só remove o cartão depois de o servidor aceitar a exclusão. O fluxo de IMC exige internet e não mantém fila de gravações offline.

## Verificação local

```bash
npm test
npm run lint
npm run typecheck
npx expo export --platform all --clear
```

Veja [docs/VALIDACAO.md](docs/VALIDACAO.md) para os resultados observados e as limitações da validação.

Para repetir os testes do serviço real, com `.env.local` preenchido:

```bash
npm run test:firebase
```

Esse comando cria contas anônimas e registros de teste no projeto configurado e remove os dados que criou ao terminar. Não faz parte de `npm test`, pois exige internet e acesso ao Firebase.


## Referências técnicas

- Expo: https://docs.expo.dev/
- Expo Router: https://docs.expo.dev/router/introduction/
- Firebase com Expo: https://docs.expo.dev/guides/using-firebase/
- Cloud Firestore: https://firebase.google.com/docs/firestore
- AsyncStorage: https://react-native-async-storage.github.io/async-storage/
- World Bank API: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures
