# Manual de uso do CompraFácil

O CompraFácil organiza compras por listas, estima valores e registra cálculos de IMC. As listas ficam no dispositivo. O histórico do IMC fica no Firebase e a comparação populacional consulta o World Bank pela internet.

## Preparar e abrir

Na pasta principal do projeto, com Node.js 24 instalado:

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run web
```

Copie a configuração somente se `.env.local` ainda não existir. Para executar no celular, use `npm start` e abra o QR code no ambiente Expo compatível com o SDK 57. Caso esteja usando um development build, reconstrua-o após adicionar um módulo nativo. A configuração de Firebase está em [FIREBASE.md](FIREBASE.md).

## Navegar

O botão de menu no canto superior do cabeçalho abre cinco destinos: **Início**, **Minhas listas**, **Calcular IMC**, **Histórico de IMC** e **Sobre o aplicativo**. Toque no destino para abrir a seção. Toque fora do menu para fechá-lo; no celular, o gesto lateral depende do suporte do ambiente nativo.

Nova lista, Minha compra e Produto abrem com botão de voltar. Use **Cancelar** para sair de um formulário sem salvar. Os atalhos do início continuam disponíveis. Trocar de seção pelo menu mantém as listas e a sessão do histórico.

## Criar e acompanhar uma compra

1. Abra **Minhas listas** e toque em **+ Nova lista**, ou use **Criar nova lista** no início.
2. Informe um nome de até 60 caracteres e toque em **Criar lista**. Nomes vazios mostram uma mensagem de validação.
3. Em **Minha compra**, toque em **+ Adicionar produto**. Informe nome, quantidade, preço por unidade e categoria.
4. Toque em **Salvar produto**. O subtotal é quantidade × preço; o total soma todos os produtos.
5. Marque o produto como comprado para atualizar o progresso e o valor comprado. Os filtros **Todos**, **Pendentes** e **Comprados** mudam apenas a exibição.
6. Use **Editar [nome]** para corrigir os dados ou excluir o produto com confirmação. Editar preserva a marcação de comprado.

Exemplo: Café, quantidade 2 e preço 12,90 resultam em R$ 25,80. Quantidade pode ser fracionada: para compra por peso, informe kg e preço por kg. Use preço zero quando ainda não souber o valor. São aceitos vírgula ou ponto decimal, sem separador de milhar.

Para excluir uma lista e seus produtos, toque em **Excluir lista** e confira a confirmação. Cancelar mantém os dados. A lista de exemplo só aparece no primeiro acesso; excluir todas as listas não cria o exemplo novamente.

As listas são salvas automaticamente no AsyncStorage. Fechar e reabrir o app deve preservar os dados nesse dispositivo. Se houver falha de leitura ou gravação, o aplicativo mostra um aviso. Não há compartilhamento nem sincronização de listas entre dispositivos.

## Calcular e salvar o IMC

1. Abra **Calcular IMC** pelo menu ou pelo início.
2. Informe peso em kg e altura em metros. Exemplo: 70 e 1,75. Não informe 175 no campo de altura.
3. Selecione **Feminino** ou **Masculino** para a comparação populacional.
4. Toque em **Calcular e salvar**. Durante a gravação, os campos e o botão ficam desabilitados.
5. Após confirmação do Firebase, o cartão apresenta o IMC, a classificação e a indicação de que o cálculo foi salvo. O exemplo resulta em 22,86.

Cada cálculo concluído cria um registro com valor, medidas e data/hora do servidor. A confirmação só aparece após a gravação ser aceita. Em caso de falha, leia a mensagem e tente novamente; enquanto as entradas e a tela forem mantidas, a repetição reutiliza o identificador pendente para evitar duplicar uma resposta perdida.

## Entender a comparação populacional

Após salvar o IMC, o aplicativo consulta os percentuais de adultos brasileiros, por sexo, nos indicadores de 2022 do World Bank. A consulta não envia suas medidas ao World Bank.

- IMC abaixo de 25: parcela de adultos abaixo desse limite, incluindo baixo peso e faixa normal.
- De 25 até antes de 30: sobrepeso sem obesidade.
- A partir de 30: obesidade.

Os dados não permitem separar os percentuais de baixo peso e faixa normal. A classificação considera o cálculo completo antes do arredondamento; quando o valor exibido cruza visualmente um limite, a tela explica a diferença. As fórmulas e fontes estão em [WORLDBANK.md](WORLDBANK.md).

Se a API falhar, o cálculo permanece salvo. **Consultar percentuais novamente** repete somente a consulta externa, sem criar outro registro. Alterar peso, altura ou sexo remove a comparação anterior, para que dados de entradas diferentes não se misturem.

## Consultar o histórico

Abra **Histórico de IMC** pelo menu, início ou botão da calculadora. Os registros aparecem do mais recente para o mais antigo, com valor, data/hora e medidas. **Atualizar histórico** consulta novamente o banco. **Novo cálculo** retorna à calculadora pelo Drawer.

**Excluir registro** abre a confirmação no próprio cartão. **Manter registro** cancela. **Confirmar exclusão** remove apenas o registro selecionado após o servidor aceitar a operação. Use os registros de demonstração do grupo para ensaiar esse fluxo.

## Conexão e armazenamento

O Firebase utiliza uma identificação anônima persistida neste dispositivo, sem tela de login. Limpar os dados do aplicativo/navegador apaga as listas e a identificação que permite acessar o histórico anterior. Os documentos remotos não passam a outra identificação automaticamente.

O IMC requer internet e não mantém fila de gravações offline. Uma falha do Firebase impede confirmar o salvamento; uma falha só do World Bank mantém o cálculo salvo e permite repetir a comparação. A sessão de um navegador não é compartilhada automaticamente com outro aparelho.

## Atividade de filmes

[FilmesRequest](../atividades/filmesrequest/README.md) é outro projeto, com seu próprio manifesto, comandos e configuração TMDB. Não é necessário instalar ou configurar filmes para usar o CompraFácil.
