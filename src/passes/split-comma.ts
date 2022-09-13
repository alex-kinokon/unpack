import { definePlugin } from "../utils";

export const splitComma = definePlugin(({ types: t }) => ({
  SequenceExpression(path) {
    const { parentPath: parent, node } = path;
    switch (parent.node.type) {
      case "ExpressionStatement":
        parent.replaceWithMultiple(node.expressions.map(e => t.expressionStatement(e)));
        break;
      case "ForStatement":
        if (parent.node.init !== node) {
          return;
        }

      // fallthrough
      case "IfStatement":
      case "ThrowStatement":
      case "ReturnStatement": {
        const last = node.expressions.pop()!;
        parent.insertBefore(node.expressions.map(e => t.expressionStatement(e)));
        path.replaceWith(last);
        break;
      }
    }
  },
}));
