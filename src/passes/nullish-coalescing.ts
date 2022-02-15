import babel, { NodePath, PluginObj, types as t } from "@babel/core";

export default ({ types: t }: typeof babel): PluginObj => {
  const isUndefined = (node: t.Node) =>
    t.isIdentifier(node, { name: "undefined" }) ||
    t.isUnaryExpression(node, { operator: "void" });

  const matchesEqual = (
    expression: t.Expression,
    match: (expression: t.Node) => boolean,
    matchOther: (expression: t.Node) => boolean,
    extract?: (first: any, second: any) => void,
    operator = "==="
  ) =>
    t.isBinaryExpression(expression, { operator }) &&
    ((match(expression.left) &&
      matchOther(expression.right) &&
      (extract?.(expression.left, expression.right), true)) ||
      (match(expression.right) &&
        matchOther(expression.left) &&
        (extract?.(expression.right, expression.left), true)));

  return {
    name: "NullishCoalescing",
    visitor: {
      ConditionalExpression: function ConditionalExpression(path) {
        const { consequent, test, alternate } = path.node;

        let temporaryVariable: t.Identifier;
        let realExpression: t.Expression;

        if (!isUndefined(consequent)) return;

        path.traverse({ ConditionalExpression } as any);

        // null == e ? undefined : e.filter...
        if (
          matchesEqual(
            test,
            left => t.isNullLiteral(left),
            () => true,
            (_, right) => (temporaryVariable = right),
            "=="
          )
        ) {
          const scope = path.getFunctionParent();
          const obj = path.get("alternate");
          let found = false;
          obj.traverse({
            Identifier(innerPath) {
              const { parent, parentPath } = innerPath;
              if (
                parent.type !== "MemberExpression" ||
                innerPath.getFunctionParent() !== scope ||
                t.isPrivateName(parent.property)
              ) {
                return;
              }
              if (innerPath.node.name === temporaryVariable.name) {
                found = true;
                innerPath.replaceWith(t.cloneNode(temporaryVariable));
                parentPath.replaceWith(
                  t.optionalMemberExpression(
                    parent.object,
                    parent.property,
                    parent.computed,
                    true
                  )
                );
                innerPath.stop();
              }
            },
          });
          if (found) {
            path.replaceWith(obj);
          }
        }

        // null === (temp = e.test) ? undefined : temp.filter...
        if (
          t.isLogicalExpression(test, { operator: "||" }) &&
          matchesEqual(
            test.left,
            left => t.isNullLiteral(left),
            right =>
              t.isAssignmentExpression(right) &&
              t.isIdentifier(right.left) &&
              (t.isMemberExpression(right.right) ||
                t.isOptionalMemberExpression(right.right)) &&
              (realExpression = right) &&
              true,
            (_, right) => (realExpression = right)
          ) &&
          matchesEqual(
            test.right,
            left => isUndefined(left),
            right => t.isIdentifier(right)
          ) &&
          // balance
          (temporaryVariable = <t.Identifier>(
            (<t.AssignmentExpression>(<t.BinaryExpression>test.left).right).left
          )).name === (<t.Identifier>(<t.BinaryExpression>test.right).right).name &&
          // alternate
          !t.isPrivateName((<t.MemberExpression>alternate).property)
        ) {
          const scope = path.getFunctionParent();

          const obj = path.get("alternate") as NodePath<t.Node>;
          let found = false;

          obj.traverse({
            Identifier(innerPath) {
              const { parent, parentPath } = innerPath;
              if (
                parent.type !== "MemberExpression" ||
                innerPath.getFunctionParent() !== scope ||
                t.isPrivateName(parent.property)
              ) {
                return;
              }
              if (innerPath.node.name === temporaryVariable.name) {
                innerPath.replaceWith(realExpression);
                parentPath.replaceWith(
                  t.optionalMemberExpression(
                    t.isAssignmentExpression(parent.object, { operator: "=" })
                      ? parent.object.right
                      : parent.object,
                    parent.property,
                    parent.computed,
                    true
                  )
                );
                found = true;
                innerPath.stop();
              }
            },
          });
          if (found) {
            path.replaceWith(alternate);
          }
        }
      },
    },
  };
};
