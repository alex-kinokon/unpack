import { parseAsync, transformFromAstAsync } from "@babel/core";
import { format, Options } from "prettier";
import chalk from "chalk";
import * as passes from "./passes/index";
import { getParserPlugins } from "./utils";

type PassOptions = {
  [key in keyof typeof passes]?: boolean;
};

export const defaultOptions: PassOptions = {
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
    ...options
  }: PassOptions & {
    filename: string;
    prettier?: Options;
  }
) {
  const plugins = Object.entries(passes)
    .filter(([name]) => (options as any)[name])
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
    plugins,
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
