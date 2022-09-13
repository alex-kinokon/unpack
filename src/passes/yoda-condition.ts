import type { types as t } from "@babel/core";
import { definePlugin } from "../utils";

export const yodaCondition = definePlugin(() => ({
  BinaryExpression(path) {
    const { node } = path;
    if (!["==", "===", "!=", "!=="].includes(node.operator)) {
      return;
    }

    function swap() {
      const { right } = node;
      node.right = node.left as t.Expression;
      node.left = right;
    }

    switch (node.left.type) {
      case "StringLiteral":
      case "NumericLiteral":
      case "NullLiteral":
      case "BigIntLiteral":
      case "BooleanLiteral":
        swap();
        break;
      case "Identifier":
        if (node.left.name === "undefined") {
          swap();
        }
    }
  },
}));
