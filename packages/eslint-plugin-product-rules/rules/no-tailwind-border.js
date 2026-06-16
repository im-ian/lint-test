function isClassAttribute(node) {
  return node.name.type === 'JSXIdentifier' && ['className', 'class'].includes(node.name.name);
}

function getStringParts(node) {
  // className 안에서 정적으로 알 수 있는 문자열 조각만 모읍니다.
  if (!node) {
    return [];
  }

  if (node.type === 'Literal' && typeof node.value === 'string') {
    return [{ node, text: node.value }];
  }

  if (node.type === 'TemplateLiteral') {
    return node.quasis.map((quasi) => ({
      node: quasi,
      text: quasi.value.cooked ?? quasi.value.raw
    }));
  }

  if (node.type === 'JSXExpressionContainer') {
    return getStringParts(node.expression);
  }

  if (node.type === 'ConditionalExpression') {
    return [...getStringParts(node.consequent), ...getStringParts(node.alternate)];
  }

  if (node.type === 'LogicalExpression') {
    return [...getStringParts(node.left), ...getStringParts(node.right)];
  }

  if (node.type === 'ArrayExpression') {
    return node.elements.flatMap((element) => getStringParts(element));
  }

  if (node.type === 'CallExpression') {
    return node.arguments.flatMap((argument) => getStringParts(argument));
  }

  if (node.type === 'ObjectExpression') {
    return node.properties.flatMap((property) => {
      if (property.type !== 'Property') {
        return [];
      }

      // clsx/cn({ 'border': active })처럼 객체 key에 class가 들어가는 패턴을 지원합니다.
      return [...getStringParts(property.key), ...getStringParts(property.value)];
    });
  }

  return [];
}

function getTailwindBaseClassName(className) {
  // md:hover:border처럼 variant가 붙으면 마지막 콜론 뒤의 실제 utility만 비교합니다.
  let bracketDepth = 0;
  let lastVariantColonIndex = -1;

  for (let index = 0; index < className.length; index += 1) {
    const character = className[index];

    if (character === '[') {
      bracketDepth += 1;
      continue;
    }

    if (character === ']') {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }

    if (character === ':' && bracketDepth === 0) {
      lastVariantColonIndex = index;
    }
  }

  return className.slice(lastVariantColonIndex + 1);
}

function isTailwindBorderClass(className) {
  const baseClassName = getTailwindBaseClassName(className);

  return baseClassName === 'border' || baseClassName.startsWith('border-');
}

function getClassNames(text) {
  return text.trim().split(/\s+/).filter(Boolean);
}

const rule = {
  meta: {
    // React/Tailwind UI에서 경계선 표현을 border 대신 shadow로 통일하기 위한 룰입니다.
    type: 'suggestion',
    docs: {
      description: 'Disallow Tailwind border classes in React className values.'
    },
    messages: {
      noBorder:
        'Tailwind border class "{{ className }}" is not allowed. Use shadow-* or arbitrary shadow utilities instead.'
    },
    schema: []
  },
  create(context) {
    return {
      JSXAttribute(node) {
        // React에서는 className, 일부 JSX 환경에서는 class에 Tailwind 클래스가 들어갑니다.
        if (!isClassAttribute(node)) {
          return;
        }

        for (const stringPart of getStringParts(node.value)) {
          for (const className of getClassNames(stringPart.text)) {
            if (!isTailwindBorderClass(className)) {
              continue;
            }

            context.report({
              node: stringPart.node,
              messageId: 'noBorder',
              data: {
                className
              }
            });
          }
        }
      }
    };
  }
};

export default rule;
