export type AstNode = {
  type: string;
  [key: string]: any;
};

export type RuleReport = {
  node: AstNode;
  message?: string;
  messageId?: string;
  data?: Record<string, string>;
};

export type RuleContext = {
  options: unknown[];
  report(descriptor: RuleReport): void;
};

export type RuleModule = {
  meta: Record<string, unknown>;
  create(context: RuleContext): Record<string, (node: AstNode) => void>;
};
