import { definePlugin, has } from "../utils";

export const arrowFunction = definePlugin(({ types: t }) => ({
  FunctionExpression(path) {
    if (path.node.generator || path.node.id) return;

    const bailOut = has(path, {
      ThisExpression: innerPath => innerPath.getFunctionParent() === path,
      Identifier: innerPath => innerPath.node.name === "arguments",
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
