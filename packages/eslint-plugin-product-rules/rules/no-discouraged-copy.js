const DEFAULT_PATTERNS = [
  // 설정에서 patterns를 넘기지 않았을 때 사용하는 기본 금지 표현입니다.
  {
    match: '해줘',
    suggest: '해 주세요'
  },
  {
    match: '당장',
    suggest: '지금'
  }
];

function normalizePattern(pattern) {
  // 사용자가 문자열만 넘겨도 { match, suggest } 형태처럼 다룰 수 있게 맞춥니다.
  if (typeof pattern === 'string') {
    return {
      match: pattern,
      suggest: null
    };
  }

  return {
    match: pattern.match,
    suggest: pattern.suggest ?? null
  };
}

function getPatterns(options) {
  // eslint.config.mjs의 룰 옵션을 읽고, 없으면 기본 금지 표현을 사용합니다.
  const configuredPatterns = options[0]?.patterns ?? DEFAULT_PATTERNS;

  return configuredPatterns.map(normalizePattern);
}

function isCheckableText(value) {
  // 비어 있는 문자열이나 문자열이 아닌 값은 검사하지 않습니다.
  return typeof value === 'string' && value.trim().length > 0;
}

function reportMatches(context, node, text, patterns) {
  // 하나의 문자열 안에 금지 표현이 들어 있는지 확인하고 ESLint 메시지를 만듭니다.
  if (!isCheckableText(text)) {
    return;
  }

  for (const pattern of patterns) {
    if (!text.includes(pattern.match)) {
      continue;
    }

    const suggestion = pattern.suggest ? ` Suggested wording: "${pattern.suggest}".` : '';

    context.report({
      node,
      message: `Product copy contains discouraged wording "${pattern.match}".${suggestion}`
    });
  }
}

const rule = {
  meta: {
    // suggestion 타입은 코드 스타일이나 문구 개선처럼 권장 성격의 룰에 사용합니다.
    type: 'suggestion',
    docs: {
      description: 'Report product copy that does not match the configured tone.'
    },
    schema: [
      // 스키마는 eslint.config.mjs에 넣을 수 있는 옵션 형태를 제한합니다.
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          patterns: {
            type: 'array',
            items: {
              oneOf: [
                {
                  type: 'string'
                },
                {
                  type: 'object',
                  additionalProperties: false,
                  required: ['match'],
                  properties: {
                    match: {
                      type: 'string'
                    },
                    suggest: {
                      type: 'string'
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  },
  create(context) {
    // create는 ESLint가 파일 하나를 검사할 때 호출되며, 여기서 AST 방문자를 반환합니다.
    const patterns = getPatterns(context.options);

    return {
      Literal(node) {
        // '다시 시도해줘' 같은 일반 문자열 리터럴을 검사합니다.
        if (typeof node.value === 'string') {
          reportMatches(context, node, node.value, patterns);
        }
      },

      TemplateElement(node) {
        // `지금 당장 확인해 주세요` 같은 템플릿 문자열의 텍스트 조각을 검사합니다.
        reportMatches(context, node, node.value.cooked ?? node.value.raw, patterns);
      },

      JSXText(node) {
        // <Text>지금 당장 확인해줘</Text>처럼 JSX 태그 사이에 있는 텍스트를 검사합니다.
        reportMatches(context, node, node.value, patterns);
      }
    };
  }
};

export default rule;
