function getImportSpecifierName(specifier) {
  if (specifier.imported.type === 'Identifier') {
    return specifier.imported.name;
  }

  return specifier.imported.value;
}

function getJsxName(node) {
  if (node.type === 'JSXIdentifier') {
    return node.name;
  }

  if (node.type === 'JSXMemberExpression') {
    return `${getJsxName(node.object)}.${getJsxName(node.property)}`;
  }

  return null;
}

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the default React Native Image component.'
    },
    messages: {
      noImport:
        'Do not import Image from react-native. Use the app design-system image component instead.',
      noUsage:
        'Do not render the React Native Image component directly. Use the app design-system image component instead.'
    },
    schema: []
  },
  create(context) {
    const imageLocalNames = new Set();
    const reactNativeNamespaces = new Set();

    return {
      ImportDeclaration(node) {
        if (node.source.value !== 'react-native') {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && getImportSpecifierName(specifier) === 'Image') {
            imageLocalNames.add(specifier.local.name);
            context.report({
              node: specifier,
              messageId: 'noImport'
            });
          }

          if (specifier.type === 'ImportNamespaceSpecifier') {
            reactNativeNamespaces.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        const name = getJsxName(node.name);

        if (!name) {
          return;
        }

        if (imageLocalNames.has(name)) {
          context.report({
            node: node.name,
            messageId: 'noUsage'
          });
          return;
        }

        for (const namespaceName of reactNativeNamespaces) {
          if (name === `${namespaceName}.Image`) {
            context.report({
              node: node.name,
              messageId: 'noUsage'
            });
          }
        }
      }
    };
  }
};

export default rule;
