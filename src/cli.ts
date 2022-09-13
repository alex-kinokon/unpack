import fs from "fs";
import { program } from "commander";
import { kebabCase } from "lodash";
import { convert, defaultPasses } from "./index";

const command = program
  .option("-i, --input <input>", "Input file path")
  .option("-o, --output <output>", "Output file path");

const defaultOptionsKeys = Object.keys(defaultPasses) as (keyof typeof defaultPasses)[];

defaultOptionsKeys.forEach(key => {
  command.option(`--${kebabCase(key)}`, `Enable ${key}`, defaultPasses[key] as boolean);
});

command.parse();

const opts = program.opts();
const file = fs.readFileSync(opts.input, "utf-8");

convert(file, {
  filename: opts.input,
}).then(res => {
  fs.writeFileSync(opts.output, res);
});
