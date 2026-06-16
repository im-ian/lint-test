import { AST_NODE_TYPES, type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from '../create-rule.js';

type MessageIds = 'hardcodedText';
type Options = [];

type StringPart = {
  node: TSESTree.Node;
  text: string;
};

type ParentAwareJsxExpressionContainer = TSESTree.JSXExpressionContainer & {
  parent?: TSESTree.Node;
};

const USER_FACING_ATTRIBUTES = new Set([
  'accessibilityLabel',
  'alt',
  'aria-label',
  'label',
  'placeholder',
  'title'
]);

function getAttributeName(node: TSESTree.JSXAttribute): string | null {
  if (node.name.type !== AST_NODE_TYPES.JSXIdentifier) {
    return null;
  }

  return node.name.name;
}

function isUserFacingAttribute(node: TSESTree.JSXAttribute): boolean {
  const attributeName = getAttributeName(node);

  return attributeName !== null && USER_FACING_ATTRIBUTES.has(attributeName);
}

function hasTranslatableText(text: string): boolean {
  // 숫자, 공백, 기호만 있는 값은 번역 대상 문구로 보지 않습니다.
  return /\p{Letter}/u.test(text.trim());
}

function getStaticStringParts(node: TSESTree.Node | null | undefined): StringPart[] {
  // 정적으로 알 수 있는 문자열만 검사합니다. t('key') 같은 함수 호출 내부 key는 검사하지 않습니다.
  if (!node) {
    return [];
  }

  if (node.type === AST_NODE_TYPES.Literal && typeof node.value === 'string') {
    return [{ node, text: node.value }];
  }

  if (node.type === AST_NODE_TYPES.TemplateLiteral) {
    return node.quasis.map((quasi) => ({
      node: quasi,
      text: quasi.value.cooked ?? quasi.value.raw
    }));
  }

  if (node.type === AST_NODE_TYPES.JSXExpressionContainer) {
    return getStaticStringParts(node.expression);
  }

  return [];
}

function isJsxChildExpression(node: TSESTree.JSXExpressionContainer): boolean {
  const parent = (node as ParentAwareJsxExpressionContainer).parent;

  return parent?.type === AST_NODE_TYPES.JSXElement || parent?.type === AST_NODE_TYPES.JSXFragment;
}

function reportHardcodedText(
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  node: TSESTree.Node,
  text: string
) {
  if (!hasTranslatableText(text)) {
    return;
  }

  context.report({
    node,
    messageId: 'hardcodedText',
    data: {
      text: text.trim()
    }
  });
}

const rule = createRule<Options, MessageIds>({
  name: 'no-hardcoded-i18n-text',
  meta: {
    // 화면에 노출되는 문구를 하드코딩하지 않고 번역 키로 관리하게 만드는 룰입니다.
    type: 'problem',
    docs: {
      description: 'Disallow hardcoded user-facing text in JSX.'
    },
    messages: {
      hardcodedText: 'Hardcoded user-facing text "{{ text }}" is not allowed. Use t("translation.key") instead.'
    },
    schema: []
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXText(node) {
        // <Text>결제가 완료되었습니다</Text>처럼 태그 사이에 직접 적은 문구를 검사합니다.
        reportHardcodedText(context, node, node.value);
      },

      JSXExpressionContainer(node) {
        // <Text>{'Submit'}</Text>처럼 JSX child 위치에 문자열 표현식으로 넣은 문구를 검사합니다.
        if (!isJsxChildExpression(node)) {
          return;
        }

        for (const stringPart of getStaticStringParts(node.expression)) {
          reportHardcodedText(context, stringPart.node, stringPart.text);
        }
      },

      JSXAttribute(node) {
        // placeholder, alt, aria-label처럼 사용자에게 노출되는 속성만 검사합니다.
        if (!isUserFacingAttribute(node)) {
          return;
        }

        for (const stringPart of getStaticStringParts(node.value)) {
          reportHardcodedText(context, stringPart.node, stringPart.text);
        }
      }
    };
  }
});

export default rule;
