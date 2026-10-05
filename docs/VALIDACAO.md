# Validação realizada

- Instalação das dependências: concluída.
- `npm test`: 2 testes passaram, cobrindo entrada inválida, vírgula decimal, cálculo, edição, marcação e exclusão sem afetar outra lista.
- `npx expo export --platform all`: bundles de Android, iOS e web gerados com sucesso.
- `EXPO_OFFLINE=1 npx expo install --check`: dependências compatíveis segundo os metadados locais. A consulta online falhou por timeout de rede; a validação offline é limitada.
- Não foi possível executar a verificação visual automatizada: o download do navegador de testes retornou arquivo inválido.
- Não houve execução em aparelho físico ou emulador. A geração de bundles não substitui esse teste.

Antes da apresentação, executem o checklist do README no aparelho ou navegador que será utilizado, especialmente navegação, persistência ao reabrir e exclusões.
