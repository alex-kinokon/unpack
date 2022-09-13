import fs from "fs";
import { program } from "commander";
import { kebabCase } from "lodash";
import { convert, defaultOptions } from "./index";

const command = program
  .option("-i, --input <input>", "Input file path")
  .option("-o, --output <output>", "Output file path");

const defaultOptionsKeys = Object.keys(defaultOptions) as (keyof typeof defaultOptions)[];

defaultOptionsKeys.forEach(key => {
  command.option(`--${kebabCase(key)}`, `Enable ${key}`, defaultOptions[key] as boolean);
});

command.parse();

const opts = program.opts();

const file = fs.readFileSync(opts.input, "utf-8");

const options = {
  ...defaultOptions,
  filename: opts.input,
};
defaultOptionsKeys.forEach(key => {
  options[key] = opts[key];
});

convert(file, options).then(res => {
  fs.writeFileSync(opts.output, res);
});
