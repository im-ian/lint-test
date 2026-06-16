import tsParser from '@typescript-eslint/parser';

// 이 배열에는 AST로 살펴볼 샘플 코드와, 그중 어떤 노드를 출력할지 정하는 필터가 들어 있습니다.
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
      // react-native에서 가져온 import 선언 자체를 보여줍니다.
      if (node.type === 'ImportDeclaration') {
        return node.source.value === 'react-native';
      }

      // import { Image as RNImage }에서 Image 부분만 골라냅니다.
      if (node.type === 'ImportSpecifier') {
        return (node.imported.name ?? node.imported.value) === 'Image';
      }

      // 실제 JSX에서 <RNImage />를 쓰는 지점을 보여줍니다.
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
      // 일반 문자열 리터럴 중 금지 표현이 들어간 예시만 보여줍니다.
      if (node.type === 'Literal') {
        return typeof node.value === 'string' && node.value.includes('해줘');
      }

      // 백틱 문자열은 TemplateElement 노드로 들어오므로 별도로 확인합니다.
      if (node.type === 'TemplateElement') {
        return (node.value.cooked ?? node.value.raw).includes('당장');
      }

      // JSX 태그 사이의 화면 문구는 JSXText 노드로 들어옵니다.
      if (node.type === 'JSXText') {
        return node.value.trim().length > 0;
      }

      return false;
    }
  }
];

function parse(code) {
  // TypeScript/TSX 코드를 ESLint 룰이 보는 것과 비슷한 AST로 파싱합니다.
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
  // AST는 중첩 객체 트리이므로 재귀적으로 모든 하위 노드를 방문합니다.
  if (!node || typeof node !== 'object') {
    return;
  }

  // type이 있는 객체는 AST 노드로 보고 콜백에 넘깁니다.
  if (typeof node.type === 'string') {
    visit(node);
  }

  for (const [key, value] of Object.entries(node)) {
    // 위치 정보와 부모 참조는 순회 대상이 아니며, parent는 순환 참조를 만들 수 있습니다.
    if (key === 'parent' || key === 'loc' || key === 'range') {
      continue;
    }

    if (Array.isArray(value)) {
      // body, specifiers, children처럼 배열로 들어 있는 하위 노드를 순회합니다.
      for (const child of value) {
        walk(child, visit);
      }
      continue;
    }

    walk(value, visit);
  }
}

function getJsxName(node) {
  // JSXIdentifier는 <Image />처럼 단일 이름인 태그입니다.
  if (node.type === 'JSXIdentifier') {
    return node.name;
  }

  // JSXMemberExpression은 <RN.Image />처럼 점으로 이어진 태그입니다.
  if (node.type === 'JSXMemberExpression') {
    return `${getJsxName(node.object)}.${getJsxName(node.property)}`;
  }

  return null;
}

function nodeSource(code, node) {
  // range는 원본 코드에서 이 노드가 차지하는 시작/끝 위치입니다.
  return code.slice(node.range[0], node.range[1]).trim();
}

function summarizeNode(code, node) {
  // 모든 노드에 공통으로 보여줄 기본 정보입니다.
  const summary = {
    type: node.type,
    line: node.loc.start.line,
    source: nodeSource(code, node)
  };

  if (node.type === 'ImportDeclaration') {
    // import 선언에서는 어떤 모듈에서 가져왔는지가 핵심입니다.
    return {
      ...summary,
      module: node.source.value,
      specifierTypes: node.specifiers.map((specifier) => specifier.type)
    };
  }

  if (node.type === 'ImportSpecifier') {
    // import specifier에서는 원래 이름과 코드에서 쓰는 로컬 이름을 함께 봅니다.
    return {
      ...summary,
      imported: node.imported.name ?? node.imported.value,
      local: node.local.name
    };
  }

  if (node.type === 'JSXOpeningElement') {
    // JSX 여는 태그에서는 실제 태그 이름만 뽑아 보면 룰 흐름을 이해하기 쉽습니다.
    return {
      ...summary,
      name: getJsxName(node.name)
    };
  }

  if (node.type === 'Literal') {
    // 일반 문자열 리터럴의 실제 값을 보여줍니다.
    return {
      ...summary,
      value: node.value
    };
  }

  if (node.type === 'TemplateElement') {
    // 템플릿 문자열의 cooked 값은 이스케이프가 해석된 텍스트입니다.
    return {
      ...summary,
      value: node.value.cooked ?? node.value.raw
    };
  }

  if (node.type === 'JSXText') {
    // JSX 텍스트는 들여쓰기 공백이 섞일 수 있어 trim한 값을 함께 보여줍니다.
    return {
      ...summary,
      value: node.value.trim()
    };
  }

  return summary;
}

for (const example of examples) {
  // 샘플 코드를 AST로 바꾼 뒤, include 조건에 맞는 노드만 모읍니다.
  const ast = parse(example.code);
  const matchedNodesByLocation = new Map();

  walk(ast, (node) => {
    if (example.include(node)) {
      // 같은 위치의 노드가 중복으로 잡히면 하나만 남깁니다.
      matchedNodesByLocation.set(
        `${node.type}:${node.range[0]}:${node.range[1]}`,
        summarizeNode(example.code, node)
      );
    }
  });

  // 출력이 코드에 등장한 순서대로 보이도록 줄 번호 기준으로 정렬합니다.
  const matchedNodes = [...matchedNodesByLocation.values()].sort((left, right) => {
    return left.line - right.line;
  });

  // 사람이 읽기 쉬운 JSON 형태로 요약 AST를 출력합니다.
  console.log(`\n## ${example.title}`);
  console.log(JSON.stringify(matchedNodes, null, 2));
}
