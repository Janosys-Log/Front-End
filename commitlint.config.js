export default {
  extends: ['@commitlint/config-conventional'],
  ignores: [
    // Merge antigo da US12 (90bf7ce) com mensagem fora do padrão, já na staged
    (message) => message.startsWith('feat(US12) fix:'),
  ],
};