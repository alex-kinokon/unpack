import babel, { PluginObj } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => ({
  name: "SplitComma",
  visitor: {
    SequenceExpression(path) {
      const { parentPath: parent, node } = path;
      switch (parent.type) {
        case "ExpressionStatement":
          parent.replaceWithMultiple(node.expressions.map(e => t.expressionStatement(e)));
          break;
        case "ForStatement":
        case "IfStatement":
        case "ReturnStatement": {
          const last = node.expressions.pop()!;
          parent.insertBefore(node.expressions.map(e => t.expressionStatement(e)));
          path.replaceWith(last);
          break;
        }
      }
    },
  },
});
