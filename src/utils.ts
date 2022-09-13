import { extname } from "path";
import type * as Babel from "@babel/core";
import type { Node, NodePath, ParserOptions, PluginObj, Visitor } from "@babel/core";

export function definePlugin(plugin: (babel: typeof Babel) => PluginObj | Visitor<any>) {
  let pluginName = "";

  function pluginFn(babel: typeof Babel): PluginObj {
    let pluginValue = plugin(babel);
    if (!("visitor" in pluginValue)) {
      pluginValue = { visitor: pluginValue };
    }

    return { ...pluginValue, name: pluginName ?? pluginValue.name };
  }

  pluginFn.setName = (name: string) => {
    pluginName = name;
  };

  return pluginFn;
}

export function has(
  path: Babel.NodePath,
  visitors: {
    [Type in Node["type"]]?: (path: NodePath<Extract<Node, { type: Type }>>) => boolean;
  }
) {
  let has = false;
  path.traverse(
    Object.fromEntries(
      Object.entries(visitors).map(([key, value]) => [
        key,
        (path: NodePath<any>) => {
          if (value(path)) {
            has = true;
            path.stop();
          }
        },
      ])
    )
  );

  return has;
}

type ParserPlugin = NonNullable<ParserOptions["plugins"]>[number];

export function getParserPlugins(filename: string): ParserPlugin[] {
  const ext = extname(filename).slice(1);

  return (
    [
      "decorators-legacy",
      "asyncGenerators",
      /^m?tsx?$/.test(ext) && "typescript",
      /^m?[jt]sx$/.test(ext) && "jsx",
    ] as (ParserPlugin | false)[]
  ).filter(Boolean);
}
