import babel, { PluginObj } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => ({
  name: "SplitVariableDeclarator",
  visitor: {
    VariableDeclaration(path) {
      const { node } = path;
      if (path.parent.type === "ForStatement") {
        return;
      }

      if (node.declarations.length > 1) {
        path.replaceWithMultiple(
          node.declarations.map(dec => t.variableDeclaration(node.kind, [dec]))
        );
      }
    },
  },
});
