# Configurar e demonstrar o Firebase

O repositório não inclui um projeto Firebase nem credenciais de administração. A configuração abaixo é necessária para habilitar a calculadora e o histórico. A tela de listas continua usando apenas o armazenamento local.

## Projeto e aplicativo

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

## Authentication e Firestore

1. Em **Authentication > Método de login**, habilite o provedor **Anônimo**. Não há formulário de cadastro: o aplicativo identifica automaticamente cada usuário.
2. Crie o **Cloud Firestore**, na edição Standard, banco `(default)`. Escolha a região apropriada para o projeto do grupo.
3. Na aba **Regras**, use o conteúdo de `firestore.rules` e publique. As regras fornecidas liberam somente `users/{uid}/imcRecords/{id}` para o próprio usuário autenticado; demais caminhos permanecem bloqueados. Em um projeto já utilizado por outro app, integre esse bloco às regras existentes em vez de substituí-las.
4. Reinicie o Expo para carregar o arquivo de ambiente:

```bash
npm ci
npx expo start --clear
```

O serviço usa Firestore Lite: cada consulta busca os dados no servidor. Não usa modo de teste público, fila offline ou histórico compartilhado.

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

Referências: [Firebase com Expo](https://docs.expo.dev/guides/using-firebase/), [autenticação anônima](https://firebase.google.com/docs/auth/web/anonymous-auth), [timestamp de servidor](https://firebase.google.com/docs/firestore/manage-data/add-data#server_timestamp) e [Firestore Lite](https://firebase.google.com/docs/firestore/solutions/firestore-lite).
