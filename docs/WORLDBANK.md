# IMC e população brasileira — World Bank

A tela de IMC usa `fetch`, sem dependências novas, em `src/services/worldBank.js`. Depois de confirmar o salvamento no Firebase, consulta os quatro indicadores em uma única requisição HTTPS. O peso, a altura, o IMC e o usuário não são enviados ao World Bank; a requisição contém somente país, indicadores, fonte e ano.

## Requisição

```text
https://api.worldbank.org/v2/country/BRA/indicator/SH.STA.OWAD.FE.ZS;SH.STA.OWAD.MA.ZS;SH.STA.OB18.FE.ZS;SH.STA.OB18.MA.ZS?format=json&source=14&date=2022&per_page=100
```

`BRA` identifica o Brasil; a fonte `14` é Gender Statistics. Usa-se 2022 para manter todos os percentuais no mesmo ano, conforme o exemplo da atividade. Na consulta histórica de 30/10/2026, 2022 era o ano comum mais recente dos quatro indicadores.

A resposta tem o formato `[metadados, observações]`. O código identifica cada observação pelo código do indicador, valida Brasil/2022 e rejeita valores ausentes, duplicados, não numéricos ou fora de 0–100. Também exige que obesidade não supere o sobrepeso. `null` nunca vira zero. Não há percentuais fixos nem dados simulados no código de produção.

Valores retornados pelo serviço em 30/10/2026 (podem ser revisados pelo provedor):

| Indicador | Mulheres | Homens |
| --- | ---: | ---: |
| Sobrepeso, incluindo obesidade — `SH.STA.OWAD.FE.ZS` / `SH.STA.OWAD.MA.ZS` | 64,38% | 61,42% |
| Obesidade — `SH.STA.OB18.FE.ZS` / `SH.STA.OB18.MA.ZS` | 31,88% | 24,16% |

## Comparação sem dupla contagem

Os indicadores são de adultos com **18 anos ou mais**, por sexo. O app utiliza os limites da OMS pedidos na atividade: sobrepeso a partir de 25 e obesidade a partir de 30. Os metadados do World Bank usam a redação “mais de 25” para sobrepeso; a classificação da interface segue a convenção OMS de **≥ 25**.

Se `S` é o sobrepeso incluindo obesidade e `O` é a obesidade:

| IMC do cálculo | Parcela comparável | Mulheres | Homens |
| --- | --- | ---: | ---: |
| Abaixo de 25 | `100 − S` | 35,62% | 38,58% |
| De 25 até antes de 30 | `S − O` | 32,50% | 37,26% |
| 30 ou mais | `O` | 31,88% | 24,16% |

Assim, `100 − (S − O) − O = 100 − S`. Subtrair `S` e `O` diretamente do total contaria a obesidade duas vezes.

**Limite dos dados:** IMC abaixo de 25 inclui baixo peso e faixa normal. A tela classifica o IMC como baixo peso (<18,5) ou faixa normal (18,5–<25), mas informa que o percentual disponível abrange os dois. Não é um percentil individual nem um percentual exclusivo de peso normal.

A classificação usa `peso / altura²` sem arredondar antes de comparar os limites. O valor apresentado e salvo continua com duas casas. Quando o arredondamento visual atravessa um limite, a interface explica essa diferença.

## Estados da consulta e histórico

- A seleção de sexo é obrigatória; os dois controles indicam a seleção visualmente e por acessibilidade.
- Durante a requisição, a tela informa que está consultando o World Bank.
- A consulta tem prazo de 12 segundos. Erro de rede, HTTP, JSON inválido ou ausência dos indicadores gera uma mensagem, sem inventar percentuais.
- O cálculo já salvo permanece no histórico se a API falhar. O botão de nova consulta não grava outro documento Firebase.
- Alterar as entradas, iniciar outro cálculo ou desmontar a tela cancela/descarta a comparação anterior, evitando misturar sexo, medidas e resposta.
- O histórico mantém os quatro campos existentes. Sexo e percentuais não são persistidos nesta etapa.

## Demonstração

1. Informe 70 kg / 1,75 m, selecione Masculino e calcule: IMC 22,86, faixa normal, grupo com IMC abaixo de 25 (38,58% na consulta de referência).
2. Selecione Feminino e calcule novamente: mesmo IMC, grupo de 35,62%.
3. Teste 100 kg / 1,75 m, Feminino: IMC 32,65, obesidade, 31,88%.
4. Teste 119,99 kg / 2 m, Masculino: o valor visual é 30,00, mas o IMC completo é 29,9975; a faixa é sobrepeso, 37,26%, com explicação do arredondamento.
5. Abra o histórico para conferir valor e data dos cálculos.

## Testes e fontes

`npm test` inclui testes offline das faixas, fórmulas e contrato HTTP. `tests/fixtures/worldBank-bra-2022.json` é uma resposta real obtida em 30/10/2026, usada somente nos testes. A integração real pode ser conferida executando o aplicativo com internet.

- [Estrutura da API e consulta com múltiplos indicadores](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures).
- [Metadados oficiais dos quatro indicadores](https://api.worldbank.org/v2/sources/14/series/SH.STA.OWAD.FE.ZS;SH.STA.OWAD.MA.ZS;SH.STA.OB18.FE.ZS;SH.STA.OB18.MA.ZS/metadata?format=json&per_page=1000).
- [OMS: obesidade e sobrepeso, incluindo os limites de IMC](https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight).
- [OMS: distinção entre baixo peso, faixa normal, sobrepeso e obesidade](https://apps.who.int/nutrition/landscape/help.aspx?helpid=392&lang=EN&menu=0).
