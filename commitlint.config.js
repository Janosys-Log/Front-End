export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    // Merge antigo da US12 (90bf7ce) com mensagem fora do padrão, já na staged
    (message) => message.startsWith('feat(US12) fix:'),
    // Merge do PR #42 (9b350c9) com mensagem em português, já na staged
    (message) => message.startsWith('Merge da pull request'),
  ],
};