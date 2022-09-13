import { definePlugin } from "../utils";

export const dangerouslyRemoveContextStripping = definePlugin(({ types: t }) => ({
  SequenceExpression(path) {
    const { expressions: exp } = path.node;
    if (exp.length === 2 && t.isNumericLiteral(exp[0], { value: 0 })) {
      path.replaceWith(exp[1]);
    }
  },
}));
