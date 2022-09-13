import type { NodePath } from "@babel/core";
import type { Node } from "@babel/types";
import { definePlugin } from "../utils";

export const attachToStringFunction = definePlugin(({ types: t }) => {
  const $id = t.identifier;

  const getAssigner = () => {
    const toString = t.functionExpression(
      $id("toString"),
      [],
      t.blockStatement([t.returnStatement($id("string"))])
    );
    const assigner = t.arrowFunctionExpression(
      [$id("fn"), $id("string")],
      t.blockStatement([
        t.expressionStatement(
          t.callExpression(t.memberExpression($id("Reflect"), $id("defineProperty")), [
            $id("fn"),
            t.stringLiteral("toString"),
            t.objectExpression([t.objectProperty($id("value"), toString)]),
          ])
        ),
        t.returnStatement($id("fn")),
      ])
    );

    return [assigner, toString] as const;
  };

  return {
    Program(path) {
      const program = path.node;

      const assignerId = path.scope.generateUidIdentifier("assignToString");
      const [assigner, toStringNode] = getAssigner();
      program.body.unshift(
        t.variableDeclaration("const", [t.variableDeclarator(assignerId, assigner)])
      );

      const attached = new WeakSet<Node>();
      attached.add(assigner);
      attached.add(toStringNode);

      function assignSource(path: NodePath<any>) {
        if (attached.has(path.node)) {
          return;
        }
        attached.add(path.node);

        const stringId = path.scope.generateUidIdentifier();
        program.body.unshift(
          t.variableDeclaration("const", [
            t.variableDeclarator(stringId, t.stringLiteral(path.getSource())),
          ])
        );

        path.replaceWith(
          t.callExpression(t.cloneNode(assignerId), [path.node, t.cloneNode(stringId)])
        );
      }

      path.traverse({
        FunctionDeclaration(path) {
          assignSource(path);
        },
        FunctionExpression(path) {
          assignSource(path);
        },
        ArrowFunctionExpression(path) {
          assignSource(path);
        },
      });
    },
  };
});
