# Configurar e demonstrar o Firebase

O projeto `comprafacil-imc` foi configurado em 24/10/2026 na conta do grupo. Usa plano Spark, aplicativo Web **CompraFacil Expo**, autenticação anônima e Firestore Standard `(default)` em `southamerica-east1` (São Paulo). As regras de `firestore.rules` foram publicadas e os testes contra o serviço real passaram.

O arquivo `.env.example` contém os quatro identificadores públicos do aplicativo do grupo. Não há credenciais de administração no repositório. A tela de listas continua usando apenas o armazenamento local.

## Executar o projeto do grupo

No PowerShell, na raiz do clone:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run web
```

Em macOS/Linux, use `cp .env.example .env.local` para copiar o arquivo. O projeto já tem Authentication, Firestore e regras configurados; não é necessário acessar o Console nem criar outro banco para executar o aplicativo. Preserve seu `.env.local` se já estiver usando um Firebase próprio.

Esses identificadores são [públicos por definição no Firebase](https://firebase.google.com/docs/projects/api-keys); o acesso aos documentos depende da autenticação e das regras publicadas. `.env.local` continua ignorado pelo Git para permitir configurações locais.

## Usar outro projeto Firebase (opcional)

Os passos abaixo servem apenas para configurar um Firebase próprio. Não são necessários para executar o trabalho com `comprafacil-imc`.

1. No [Firebase Console](https://console.firebase.google.com/), crie um projeto para o trabalho ou selecione o projeto do grupo.
2. Registre um aplicativo **Web** nas configurações do projeto. O Firebase JS SDK usa essa configuração no Android, iOS e navegador com Expo Go; não é necessário adicionar arquivos nativos de configuração.
3. Copie `.env.example` para `.env.local` na raiz do repositório e preencha os quatro valores do objeto `firebaseConfig`:

| Variável | Campo do Firebase |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | `apiKey` |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | `projectId` |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | `appId` |

Esses identificadores são a configuração pública do cliente. Não coloque chave de conta de serviço, credencial de administrador ou token nessas variáveis: `EXPO_PUBLIC_*` entra no aplicativo distribuído. O arquivo local fica ignorado pelo Git. O acesso aos documentos depende das regras e da autenticação.

### Authentication e Firestore do projeto próprio

1. Em **Authentication > Método de login**, habilite o provedor **Anônimo**. Não há formulário de cadastro: o aplicativo identifica automaticamente cada usuário.
2. Crie o **Cloud Firestore**, na edição Standard, banco `(default)`. Escolha a região apropriada para o projeto do grupo.
3. Na aba **Regras**, use o conteúdo de `firestore.rules` e publique. As regras fornecidas liberam somente `users/{uid}/imcRecords/{id}` para o próprio usuário autenticado; demais caminhos permanecem bloqueados. Em um projeto já utilizado por outro app, integre esse bloco às regras existentes em vez de substituí-las.
4. Reinicie o Expo para carregar o arquivo de ambiente:

```bash
npm ci
npx expo start --clear
```

O serviço usa Firestore Lite: cada consulta busca os dados no servidor. Não usa modo de teste público, fila offline ou histórico compartilhado.

Ao exportar depois de alterar o ambiente, use `npx expo export --platform all --clear` para evitar que um bundle em cache conserve a configuração anterior.

## Dados gravados

Caminho: `users/{uid}/imcRecords/{documentId}`.

| Campo | Tipo | Conteúdo |
| --- | --- | --- |
| `value` | number | IMC arredondado para duas casas |
| `weight` | number | Peso em kg |
| `height` | number | Altura em metros |
| `calculatedAt` | timestamp | Data e hora da gravação, atribuídas pelo servidor |

Um cálculo novo recebe um ID novo. Uma tentativa de repetir um envio com erro conserva o ID enquanto o formulário não for alterado ou fechado, evitando documentos duplicados quando a confirmação se perde. As regras aceitam atualização somente com as mesmas medidas e o mesmo resultado, renovando a data do servidor.

A sessão é persistida no AsyncStorage no Android/iOS e pelo Firebase no navegador. Limpar os dados locais, reinstalar o app ou usar outro navegador pode gerar outra identidade e outro histórico. A versão atual não oferece recuperação de conta ou sincronização de identidade entre aparelhos.

## Checklist para a apresentação

1. Calcule **70 / 1,75** e confira **22,86**, com confirmação de salvamento.
2. Abra o histórico e confira valor, data, horário e medidas.
3. Confira o documento no Console do Firebase no caminho acima.
4. Calcule outros valores e confira a ordem do histórico. Repetir as mesmas medidas deve criar outro registro.
5. Feche e reabra o aplicativo, no mesmo aparelho/navegador; confira a mesma identidade e o histórico anterior.
6. Toque em excluir e depois em **Manter registro**; o documento deve permanecer.
7. Confirme a exclusão de um registro de teste; confira sua ausência no histórico e no Console.
8. Use outro aparelho/navegador e confirme que não enxerga os registros do primeiro usuário.
9. Desative a internet e tente salvar. O aplicativo deve informar erro e não exibir confirmação de sucesso; reconecte e tente novamente.

Este checklist requer o projeto configurado e não deve ser apresentado como executado apenas porque o bundle compilou.

## Testes automatizados do serviço

```bash
npm run test:firebase
```

O script usa o SDK público com contas anônimas novas, sem privilégios de administrador. Verifica valor e timestamp, ordenação, retry sem duplicatas, exclusão, isolamento entre usuários, bloqueio sem autenticação e rejeição de dados inválidos. Ao terminar, remove somente os documentos e contas que ele mesmo criou. O registro de exemplo criado pela interface permanece disponível no histórico do navegador usado na demonstração.

Referências: [Firebase com Expo](https://docs.expo.dev/guides/using-firebase/), [autenticação anônima](https://firebase.google.com/docs/auth/web/anonymous-auth), [timestamp de servidor](https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp) e [Firestore Lite](https://firebase.google.com/docs/firestore/solutions/firestore-lite).
