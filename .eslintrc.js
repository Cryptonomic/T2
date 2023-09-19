module.exports = {
    extends: 'erb',
    rules: {
        // A temporary hack related to IDE not resolving correct package.json
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'error',
        // Since React 17 and typescript 4.1 you can safely disable the rule
        'react/react-in-jsx-scope': 'off',
        'no-restricted-syntax': 'off',
        'import/no-cycle': 'off',
        'no-useless-escape': 'off',
        'consistent-return': 'off',
        'react/jsx-no-bind': 'off',
        'global-require': 'off',
        'import/prefer-default-export': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'prefer-destructuring': 'off',
        'promise/catch-or-return': 'off',
        'promise/always-return': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'react/no-array-index-key': 'off',
        'react/require-default-props': 'off',
        'react/default-props-match-prop-types': 'off',
        'react/jsx-props-no-spreading': 'off',
        'react/no-unused-prop-types': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'no-nested-ternary': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/prop-types': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        'no-plusplus': 'off',
        'no-return-assign': 'off',
        'no-param-reassign': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'react/destructuring-assignment': 'off',
        'react/no-unescaped-entities': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        'no-underscore-dangle': 'off',
        'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
        'import/extensions': [1, 'ignorePackages', { ts: 'never', tsx: 'never' }],
    },
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        createDefaultProgram: true,
    },
    settings: {
        'import/resolver': {
            // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
            node: {},
            webpack: {
                config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
            },
            typescript: {},
        },
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
    },
};