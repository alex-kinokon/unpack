import { definePlugin } from "../utils";

export const logicalExpressionToIf = definePlugin(({ types: t }) => ({
  ConditionalExpression(path) {
    const { parentPath: parent, node } = path;
    if (parent.type !== "ExpressionStatement") return;

    parent.replaceWith(
      t.ifStatement(
        node.test,
        t.blockStatement([t.expressionStatement(node.consequent)]),
        t.blockStatement([t.expressionStatement(node.alternate)])
      )
    );
  },

  LogicalExpression(path) {
    const { parentPath: parent, node } = path;
    if (parent.type !== "ExpressionStatement") return;

    if (node.operator === "&&") {
      parent.replaceWith(
        t.ifStatement(node.left, t.blockStatement([t.expressionStatement(node.right)]))
      );
    } else if (node.operator === "||") {
      parent.replaceWith(
        t.ifStatement(
          t.unaryExpression("!", node.left),
          t.blockStatement([t.expressionStatement(node.right)])
        )
      );
    }
  },
}));
