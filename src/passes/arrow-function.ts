import babel, { PluginObj } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => ({
  name: "ArrowFunction",
  visitor: {
    FunctionExpression(path) {
      let hasThis = false;
      path.traverse({
        ThisExpression(innerPath) {
          if (innerPath.getFunctionParent() === path) {
            hasThis = true;
            innerPath.stop();
          }
        },
      });

      if (!hasThis) {
        const { params, body } = path.node;
        path.replaceWith(
          t.arrowFunctionExpression(
            params,
            body.body.length === 1 &&
              body.body[0].type === "ReturnStatement" &&
              body.body[0].argument &&
              body.body[0].argument.type !== "SequenceExpression"
              ? body.body[0].argument
              : body
          )
        );
      }
    },
  },
});
