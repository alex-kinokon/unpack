import { extname } from "path";
import type { PluginObj, ParserOptions } from "@babel/core";

export function definePlugin(plugin: (babel: typeof import("@babel/core")) => PluginObj) {
  return plugin;
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
