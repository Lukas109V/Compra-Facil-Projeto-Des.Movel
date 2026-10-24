# Validação — integração de IMC, 24/10/2026

## Verificações executadas

- `npm test`: **5 testes passaram**. Cobrem as regras anteriores de compras e os novos casos de IMC: fórmula, arredondamento, vírgula/ponto decimal, medidas inválidas, altura em centímetros e formatação de data e horário.
- `npm run lint`: passou, sem erros ou avisos no código final.
- `npm run typecheck`: passou com `checkJs`, incluindo o código JavaScript de telas, contexto e serviços.
- `npx expo install --check`: consulta online concluída; dependências compatíveis com o SDK Expo 57. O Expo foi alinhado ao patch 57.0.31, Reanimated 4.5.1 e Worklets 0.10.1.
- `npx expo export --platform all`: bundles web, iOS e Android gerados, incluindo bytecode Hermes para os aplicativos nativos. O ambiente restrito inicialmente impediu escrita de temporários; a exportação autorizada fora dessa restrição passou.
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

## Pendências e limites

- Nenhum projeto Firebase foi conectado/configurado nesta execução. O plugin consta disponível no catálogo, mas sem instalação/conexão confirmada. `.env.example` contém apenas nomes de variáveis, sem valores fictícios apresentados como configuração real.
- Gravação, leitura, ordenação, exclusão, restauração da sessão anônima e isolamento entre usuários **ainda não foram exercitados contra um Firebase real nem emulador**. As regras foram inspecionadas no código; não foram publicadas nem executadas por um emulador.
- Não houve execução em aparelho físico ou emulador Android/iOS. Geração de bundles não comprova comportamento nativo.
- O fluxo de IMC requer internet. Não há fila offline; uma falha não recebe confirmação de salvamento. Retry preserva o ID somente enquanto o formulário permanecer aberto e sem alterações.
- O gerenciador npm informou avisos de segurança na árvore de dependências. Não foi executado `npm audit fix` nem atualização geral fora da integração.

Para concluir a validação, configure o projeto e execute o checklist de [FIREBASE.md](FIREBASE.md), incluindo a conferência dos documentos no Console e o teste no aparelho da apresentação.
