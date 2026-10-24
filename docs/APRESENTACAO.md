# Roteiro de apresentação — CompraFácil

Integrantes: Lucas Gabriel Gomes Martins e Gabriel de Carvalho Souza.
Duração sugerida: 6 a 8 minutos, ajustável à orientação do professor.

## Lucas — problema, interface e navegação

“Nosso aplicativo se chama CompraFácil. Ele ajuda a organizar compras por listas, mostrando o que falta comprar e uma estimativa de custo. Escolhemos esse tema porque permite demonstrar navegação, formulários, estado e usabilidade com uma aplicação pequena e completa.”

1. Mostre o início e o resumo de produtos pendentes.
2. Abra Minhas listas e crie a lista “Compra da apresentação”.
3. Explique que o Expo Router gerencia as telas usando arquivos em `src/app/`.
4. Mostre `src/app/_layout.js`: cada `Stack.Screen` configura uma rota.
5. Explique que `router.push` abre uma tela, `router.back` retorna e `router.replace` substitui o formulário pela lista criada.

## Gabriel — produtos, cálculos e persistência

1. Tente salvar um produto sem nome para demonstrar a validação.
2. Cadastre Café, quantidade 2, preço 12,90; o subtotal será R$ 25,80.
3. Cadastre Leite, quantidade 1, preço 5,50; o total será R$ 31,30.
4. Marque Café como comprado: o valor comprado será R$ 25,80, com 1 de 2 produtos concluídos.
5. Mostre os filtros Pendentes e Comprados.
6. Edite Leite para quantidade 2; o total passa a R$ 36,80.
7. Feche e reabra o aplicativo para demonstrar o salvamento.
8. Mostre a confirmação de exclusão e cancele antes de confirmar.

“O estado das listas é compartilhado por um Context. As telas enviam ações como adicionar, editar e marcar. O código cria novas estruturas de dados para que o React atualize a interface. O AsyncStorage salva as listas localmente em JSON. O histórico de IMC usa o Firebase; não há consulta de preços.”

## IMC e Firebase — após configurar o projeto

1. Abra **Calcular IMC**, informe 70 kg e 1,75 m e confira 22,86.
2. Mostre a confirmação de salvamento e o histórico com data e horário.
3. Mostre o documento correspondente no Console do Firebase: `users/{uid}/imcRecords/{id}`.
4. Reabra o app e confira o histórico. Demonstre cancelar e confirmar a exclusão de um registro de teste.
5. Explique a identificação anônima, o isolamento dos históricos pelas regras e a necessidade de internet.

A integração foi configurada e exercitada contra o projeto `comprafacil-imc`, incluindo salvamento pela interface, histórico com data e persistência após recarregar. Os testes do serviço também verificaram exclusão e isolamento dos usuários. Em outro computador, prepare `.env.local` conforme `docs/FIREBASE.md`. Ainda é necessário testar no aparelho usado na apresentação.

## Ambos — estrutura e encerramento

Mostrem a pasta `src`, os componentes reutilizáveis e a tela Sobre com os nomes da dupla.

“A primeira etapa contém todas as telas planejadas e a navegação funcional. Incluímos estados vazios, validações, confirmação antes de excluir, filtros e salvamento local. Os preços são informados pelo usuário e os totais são estimativas.”

## Perguntas que vocês devem saber responder

**O que são componentes?** Partes reutilizáveis da interface, como `Button` e `Field`.

**O que é estado?** Dados que mudam e fazem a interface atualizar, como as listas e o filtro selecionado.

**Para que serve useState?** Guardar e atualizar dados de um componente.

**Para que serve useEffect?** Executar efeitos ligados ao ciclo do componente: carregar dados e persistir alterações.

**Para que serve Context?** Permitir que várias telas acessem o mesmo estado sem passá-lo manualmente por todos os componentes.

**Como funciona a navegação?** Uma pilha de telas; os parâmetros carregam os IDs da lista e do produto selecionados.

**Por que armazenar IDs?** Para identificar registros sem depender do nome, que pode se repetir.

**Como se calcula o total?** Somando quantidade multiplicada pelo preço unitário de cada produto; para o total comprado, entram apenas os marcados.

**Onde os dados ficam?** As listas ficam no AsyncStorage. O valor do IMC, as medidas e a data ficam no Cloud Firestore, vinculados à identidade anônima do Firebase Authentication.

**O aplicativo compartilha listas?** Não. Os dados ficam no aparelho ou navegador utilizado.

**Qual a diferença entre React Native e Expo?** React Native fornece os componentes e a base do aplicativo; Expo facilita configuração, execução e empacotamento.

## Divisão sugerida para estudo

Lucas: `src/app/_layout.js`, `MainScreens.js`, `UI.js` e `theme.js`.
Gabriel: `DetailsScreen.js`, `ItemScreen.js`, `ShoppingContext.js` e `shopping.js`.
Ambos: `ImcScreen.js`, `ImcHistoryScreen.js`, `ImcContext.js`, `services/`, `imc.js` e `firestore.rules`.
Ambos devem executar o fluxo completo e entender os demais arquivos. Esta divisão é uma sugestão de estudo, não uma declaração de autoria individual de trechos.
