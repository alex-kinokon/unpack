import { definePlugin } from "../utils";

export const splitVariableDeclarator = definePlugin(({ types: t }) => ({
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
}));
