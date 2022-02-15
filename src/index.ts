import { parseAsync, transformFromAstAsync } from "@babel/core";
import { format, Options } from "prettier";
import chalk from "chalk";
import * as passes from "./passes/index";

type PassOptions = {
  prettier?: Options;
} & {
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
};

export async function convert(src: string, { prettier, ...options }: PassOptions) {
  const plugins = Object.entries(passes)
    .filter(([name]) => (options as any)[name])
    .map(([, value]) => value);

  console.debug(chalk`Parsing AST`);
  const ast = await parseAsync(src, {
    babelrc: false,
    parserOpts: {
      plugins: ["typescript", "decorators-legacy", "jsx"],
    },
  });

  console.debug(chalk`Running {green Babel transforms}`);
  const result = await transformFromAstAsync(ast!, src, {
    ast: true,
    generatorOpts: {
      compact: false,
    },
    cloneInputAst: false,
    plugins: plugins.concat(() => ({
      visitor: {
        NumericLiteral({ node }) {
          // prettier bug
          node.extra ??= { raw: String(node.value) };
        },
      },
    })),
  });

  console.debug(chalk`Running {green prettier}`);
  const code = format(result!.code!, {
    parser: () => result!.ast!,
    semi: true,
    arrowParens: "avoid",
    tabWidth: 2,
    printWidth: 90,
    singleQuote: false,
    trailingComma: "es5",
    ...prettier,
  });
  return code;
}
