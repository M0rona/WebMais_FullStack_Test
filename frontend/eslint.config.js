import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Componentes gerados pelo shadcn CLI: código vendorizado, não escrito por nós — não
  // vale a pena manter na mesma régua estrita do resto do projeto (ex.: exportar a
  // variant junto do componente no mesmo arquivo é o próprio padrão do shadcn). Precisa
  // vir depois do bloco acima: configs flat são mescladas em ordem, e o último que casar
  // com o arquivo vence.
  { files: ['src/common/components/ui/**/*.tsx'], rules: { 'react-refresh/only-export-components': 'off' } },
);
