import { definePlugin } from "../utils";

export const forToWhile = definePlugin(({ types: t }) => ({
  ForStatement(path) {
    const { node } = path;
    if (!node.init && !node.update) {
      path.replaceWith(t.whileStatement(node.test || t.booleanLiteral(true), node.body));
    }
  },
}));
