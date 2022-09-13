import { definePlugin } from "../utils";

export default definePlugin(({ types: t }) => ({
  name: "QuotedProperties",
  visitor: {
    StringLiteral(path) {
      if (
        t.isMemberExpression(path.parent) &&
        path.parent.property === path.node &&
        /^[\w_][\w\d_]*$/.test(path.node.value)
      ) {
        path.replaceWith(t.identifier(path.node.value));
        path.parent.computed = false;
      }
    },
  },
}));
