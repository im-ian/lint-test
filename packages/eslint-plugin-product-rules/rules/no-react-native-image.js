function getImportSpecifierName(specifier) {
  // 이름을 지정해 가져온 import와 문자열 기반 import 이름을 같은 방식으로 읽습니다.
  if (specifier.imported.type === 'Identifier') {
    return specifier.imported.name;
  }

  return specifier.imported.value;
}

function getJsxName(node) {
  // JSX 태그 이름을 Image 또는 RN.Image 같은 문자열로 바꿉니다.
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
    // 메타 정보는 룰 설명, 옵션 검증 방식, 메시지 id를 ESLint에 알려주는 영역입니다.
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
    // import에서 찾은 이름을 저장해 두고, 뒤에서 JSX 사용 여부를 검사합니다.
    const imageLocalNames = new Set();
    const reactNativeNamespaces = new Set();

    return {
      ImportDeclaration(node) {
        // 이 룰은 react-native에서 가져온 import만 검사합니다.
        if (node.source.value !== 'react-native') {
          return;
        }

        for (const specifier of node.specifiers) {
          if (specifier.type === 'ImportSpecifier' && getImportSpecifierName(specifier) === 'Image') {
            // import { Image as RNImage }처럼 alias를 쓰면 JSX에는 RNImage가 등장합니다.
            imageLocalNames.add(specifier.local.name);
            context.report({
              node: specifier,
              messageId: 'noImport'
            });
          }

          if (specifier.type === 'ImportNamespaceSpecifier') {
            // import * as RN 형태는 나중에 <RN.Image />로 쓰일 수 있어 네임스페이스를 저장합니다.
            reactNativeNamespaces.add(specifier.local.name);
          }
        }
      },

      JSXOpeningElement(node) {
        // JSXOpeningElement는 <Image /> 또는 <Image>의 여는 태그를 방문합니다.
        const name = getJsxName(node.name);

        if (!name) {
          return;
        }

        if (imageLocalNames.has(name)) {
          // <Image /> 또는 <RNImage />처럼 직접 import한 Image 사용을 보고합니다.
          context.report({
            node: node.name,
            messageId: 'noUsage'
          });
          return;
        }

        for (const namespaceName of reactNativeNamespaces) {
          if (name === `${namespaceName}.Image`) {
            // <RN.Image />처럼 네임스페이스를 통해 Image를 쓰는 경우를 보고합니다.
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
