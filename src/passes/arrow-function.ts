import { definePlugin } from "../utils";

export const arrowFunction = definePlugin(({ types: t }) => ({
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

    if (bailOut) {
      return;
    }

    const { params, body, async } = path.node;
    const innerBody = body.body;

    path.replaceWith(
      t.arrowFunctionExpression(
        params,
        innerBody.length === 1 &&
          innerBody[0].type === "ReturnStatement" &&
          innerBody[0].argument &&
          innerBody[0].argument.type !== "SequenceExpression"
          ? innerBody[0].argument
          : body,
        async
      )
    );
  },
}));
