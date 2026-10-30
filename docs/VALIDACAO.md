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
