const DEFAULT_PATTERNS = [
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
  const configuredPatterns = options[0]?.patterns ?? DEFAULT_PATTERNS;

  return configuredPatterns.map(normalizePattern);
}

function isCheckableText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function reportMatches(context, node, text, patterns) {
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
    type: 'suggestion',
    docs: {
      description: 'Report product copy that does not match the configured tone.'
    },
    schema: [
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
    const patterns = getPatterns(context.options);

    return {
      Literal(node) {
        if (typeof node.value === 'string') {
          reportMatches(context, node, node.value, patterns);
        }
      },

      TemplateElement(node) {
        reportMatches(context, node, node.value.cooked ?? node.value.raw, patterns);
      },

      JSXText(node) {
        reportMatches(context, node, node.value, patterns);
      }
    };
  }
};

export default rule;
