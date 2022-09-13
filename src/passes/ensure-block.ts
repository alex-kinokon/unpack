import type * as t from "@babel/types";
import { definePlugin } from "../utils";

export const ensureBlock = definePlugin(({ types: t }) => {
  function ensureBlock<K extends string>(
    obj: {
      [key in K]?: t.Statement | t.Expression | null;
    },
    name: K,
    skipIf?: (node: t.Statement | t.Expression) => boolean
  ) {
    const value = obj[name];
    if (!value || skipIf?.(value)) return;
    if (!t.isBlockStatement(value)) {
      obj[name] = t.blockStatement([
        t.isExpression(value) ? t.expressionStatement(value) : value,
      ]);
    }
  }

  return {
    IfStatement({ node }) {
      ensureBlock(node, "consequent");
      const { alternate: alt } = node;
      if (!alt) return;
      if (
        alt.type === "BlockStatement" &&
        alt.body.length === 1 &&
        alt.body[0].type === "ExpressionStatement" &&
        (alt.body[0].expression.type === "LogicalExpression" ||
          alt.body[0].expression.type === "ConditionalExpression")
      ) {
        node.alternate = alt.body[0];
      } else if (alt.type !== "IfStatement") {
        ensureBlock(node, "alternate");
      }
    },
    WhileStatement({ node }) {
      ensureBlock(node, "body");
    },
    DoWhileStatement({ node }) {
      ensureBlock(node, "body");
    },
    ForOfStatement({ node }) {
      ensureBlock(node, "body");
    },
    ForInStatement({ node }) {
      ensureBlock(node, "body");
    },
    ForStatement({ node }) {
      ensureBlock(node, "body");
    },
  };
});
