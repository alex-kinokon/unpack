import babel, { PluginObj } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => ({
  name: "Constant",
  visitor: {
    UnaryExpression(path) {
      const { node } = path;
      if (node.operator === "!" && node.argument.type === "NumericLiteral") {
        path.replaceWith(t.booleanLiteral(!node.argument.value));
      } else if (node.operator === "void" && node.argument.type === "NumericLiteral") {
        path.replaceWith(t.identifier("undefined"));
      }
    },
  },
});
