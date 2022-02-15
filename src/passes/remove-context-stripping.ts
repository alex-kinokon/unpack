import babel, { PluginObj } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => ({
  name: "RemoveContextStripping",
  visitor: {
    SequenceExpression(path) {
      const { expressions: exp } = path.node;
      if (exp.length === 2 && t.isNumericLiteral(exp[0], { value: 0 })) {
        path.replaceWith(exp[1]);
      }
    },
  },
});
