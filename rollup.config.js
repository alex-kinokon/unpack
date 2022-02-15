// @ts-check
import ts from "rollup-plugin-ts";
import node from "@rollup/plugin-node-resolve";
import { builtinModules } from "module";
import { dependencies } from "./package.json";

/** @type {import("rollup").RollupOptions} */
const config = {
  input: "./src/index.ts",
  output: {
    file: "./lib/index.js",
    format: "cjs",
  },
  external: builtinModules.concat(Object.keys(dependencies)),
  plugins: [ts({ transpileOnly: true }), node()],
};

export default config;
