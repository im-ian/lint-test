import tsParser from '@typescript-eslint/parser';

const examples = [
  {
    title: 'React Native Image import and JSX usage',
    code: `
      import { Image as RNImage, View } from 'react-native';

      export function Example() {
        return (
          <View>
            <RNImage source={{ uri: 'https://example.com/profile.png' }} />
          </View>
        );
      }
    `,
    include(node) {
      if (node.type === 'ImportDeclaration') {
        return node.source.value === 'react-native';
      }

      if (node.type === 'ImportSpecifier') {
        return (node.imported.name ?? node.imported.value) === 'Image';
      }

      if (node.type === 'JSXOpeningElement') {
        return getJsxName(node.name) === 'RNImage';
      }

      return false;
    }
  },
  {
    title: 'Product copy in strings and JSX text',
    code: `
      import { Text } from 'react-native';

      export const retryMessage = '다시 시도해줘';
      export const urgentMessage = \`지금 당장 확인해 주세요\`;

      export function Example() {
        return <Text>지금 당장 확인해줘</Text>;
      }
    `,
    include(node) {
      if (node.type === 'Literal') {
        return typeof node.value === 'string' && node.value.includes('해줘');
      }

      if (node.type === 'TemplateElement') {
        return (node.value.cooked ?? node.value.raw).includes('당장');
      }

      if (node.type === 'JSXText') {
        return node.value.trim().length > 0;
      }

      return false;
    }
  }
];

function parse(code) {
  return tsParser.parse(code, {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    loc: true,
    range: true,
    sourceType: 'module'
  });
}

function walk(node, visit) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (typeof node.type === 'string') {
    visit(node);
  }

  for (const [key, value] of Object.entries(node)) {
    if (key === 'parent' || key === 'loc' || key === 'range') {
      continue;
    }

    if (Array.isArray(value)) {
      for (const child of value) {
        walk(child, visit);
      }
      continue;
    }

    walk(value, visit);
  }
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

function nodeSource(code, node) {
  return code.slice(node.range[0], node.range[1]).trim();
}

function summarizeNode(code, node) {
  const summary = {
    type: node.type,
    line: node.loc.start.line,
    source: nodeSource(code, node)
  };

  if (node.type === 'ImportDeclaration') {
    return {
      ...summary,
      module: node.source.value,
      specifierTypes: node.specifiers.map((specifier) => specifier.type)
    };
  }

  if (node.type === 'ImportSpecifier') {
    return {
      ...summary,
      imported: node.imported.name ?? node.imported.value,
      local: node.local.name
    };
  }

  if (node.type === 'JSXOpeningElement') {
    return {
      ...summary,
      name: getJsxName(node.name)
    };
  }

  if (node.type === 'Literal') {
    return {
      ...summary,
      value: node.value
    };
  }

  if (node.type === 'TemplateElement') {
    return {
      ...summary,
      value: node.value.cooked ?? node.value.raw
    };
  }

  if (node.type === 'JSXText') {
    return {
      ...summary,
      value: node.value.trim()
    };
  }

  return summary;
}

for (const example of examples) {
  const ast = parse(example.code);
  const matchedNodesByLocation = new Map();

  walk(ast, (node) => {
    if (example.include(node)) {
      matchedNodesByLocation.set(
        `${node.type}:${node.range[0]}:${node.range[1]}`,
        summarizeNode(example.code, node)
      );
    }
  });

  const matchedNodes = [...matchedNodesByLocation.values()].sort((left, right) => {
    return left.line - right.line;
  });

  console.log(`\n## ${example.title}`);
  console.log(JSON.stringify(matchedNodes, null, 2));
}
