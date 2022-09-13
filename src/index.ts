import { parseAsync, transformFromAstAsync } from "@babel/core";
import type { Options } from "prettier";
import { format } from "prettier";
import chalk from "chalk";
import * as passes from "./passes/index";
import { getParserPlugins } from "./utils";

type PluginOptions = {
  [key in keyof typeof passes]?: boolean;
};

Object.entries(passes).forEach(([key, value]) => {
  value.setName(key);
});

export const defaultPluginOptions: PluginOptions = {
  arrowFunction: true,
  constant: true,
  dangerouslyRemoveContextStripping: true,
  ensureBlock: true,
  logicalExpressionToIf: true,
  nullishCoalescing: true,
  splitComma: true,
  splitVariableDeclarator: true,
  quotedProperties: true,
  attachToStringFunction: false,
  yodaCondition: false,
};

export async function convert(
  src: string,
  {
    prettier,
    filename,
    plugins,
  }: {
    plugins?: PluginOptions;
    filename: string;
    prettier?: Options;
  }
) {
  plugins = { ...defaultPluginOptions, ...plugins };

  const babelPlugins = Object.entries(passes)
    .filter(([name]) => (plugins as any)[name])
    .map(([, value]) => value);

  console.debug(chalk`Parsing AST`);
  const ast = await parseAsync(src, {
    babelrc: false,
    parserOpts: {
      plugins: getParserPlugins(filename),
    },
  });

  console.debug(chalk`Running {green Babel transforms}`);
  const result = await transformFromAstAsync(ast!, src, {
    ast: true,
    generatorOpts: {
      compact: false,
    },
    cloneInputAst: false,
    plugins: babelPlugins,
  });

  console.debug(chalk`Running {green prettier}`);
  const code = format(result!.code!, {
    semi: true,
    arrowParens: "avoid",
    tabWidth: 2,
    printWidth: 90,
    singleQuote: false,
    trailingComma: "es5",
    parser: "babel",
    ...prettier,
  });
  return code;
}
