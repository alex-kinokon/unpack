import * as babel from "@babel/core";
import type { Options } from "prettier";
import { format } from "prettier";
import chalk from "chalk";
import * as passes from "./passes/index";
import { getParserPlugins } from "./utils";

export { definePlugin } from "./utils";

type FeatureOptions = {
  [key in keyof typeof passes]?: boolean;
};

Object.entries(passes).forEach(([key, value]) => {
  value.setName(key);
});

export const defaultPluginOptions: FeatureOptions = {
  arrowFunction: true,
  attachToStringFunction: false,
  constant: true,
  dangerouslyRemoveContextStripping: true,
  ensureBlock: true,
  forToWhile: true,
  logicalExpressionToIf: true,
  nullishCoalescing: true,
  quotedProperties: true,
  splitComma: true,
  splitVariableDeclarator: true,
  yodaCondition: true,
};

interface ConvertOptions {
  features?: FeatureOptions;
  filename: string;
  prettier?: Options;
  silent?: boolean;
  plugins?: ((Babel: typeof babel) => babel.PluginObj<babel.PluginPass>)[];
}

export async function convert(
  src: string,
  { prettier, filename, features, plugins, silent }: ConvertOptions
) {
  features = { ...defaultPluginOptions, ...features };

  const babelPlugins: babel.PluginItem[] = Object.entries(passes)
    .filter(([name]) => (features as any)[name])
    .map(([, value]) => value as babel.PluginItem)
    .concat(plugins ?? []);

  if (!silent) {
    console.debug(chalk`Parsing AST`);
  }

  const ast = await babel.parseAsync(src, {
    babelrc: false,
    parserOpts: {
      plugins: getParserPlugins(filename),
    },
  });

  if (!silent) {
    console.debug(chalk`Running {green Babel transforms}`);
  }

  const result = await babel.transformFromAstAsync(ast!, src, {
    ast: true,
    generatorOpts: { compact: false },
    cloneInputAst: false,
    plugins: babelPlugins,
  });

  if (!silent) {
    console.debug(chalk`Running {green prettier}`);
  }

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
