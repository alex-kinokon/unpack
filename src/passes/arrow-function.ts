import { definePlugin } from "../utils";

export default definePlugin(({ types: t }) => ({
  name: "ArrowFunction",
  visitor: {
    FunctionExpression(path) {
      if (path.node.generator) return;

      let bailOut = false;
      path.traverse({
        ThisExpression(innerPath) {
          if (innerPath.getFunctionParent() === path) {
            bailOut = true;
            innerPath.stop();
          }
        },
        Identifier(innerPath) {
          if (innerPath.node.name === "arguments") {
            bailOut = true;
            innerPath.stop();
          }
        },
      });

      if (!bailOut) {
        const { params, body, async } = path.node;
        path.replaceWith(
          t.arrowFunctionExpression(
            params,
            body.body.length === 1 &&
              body.body[0].type === "ReturnStatement" &&
              body.body[0].argument &&
              body.body[0].argument.type !== "SequenceExpression"
              ? body.body[0].argument
              : body,
            async
          )
        );
      }
    },
  },
}));
