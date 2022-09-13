import { definePlugin } from "../utils";

export const constant = definePlugin(({ types: t }) => ({
  UnaryExpression(path) {
    const { node } = path;
    if (node.operator === "!" && node.argument.type === "NumericLiteral") {
      path.replaceWith(t.booleanLiteral(!node.argument.value));
    } else if (node.operator === "void" && node.argument.type === "NumericLiteral") {
      path.replaceWith(t.identifier("undefined"));
    }
  },
}));
