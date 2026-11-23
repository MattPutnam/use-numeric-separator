import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import type { ESLint } from "eslint";
import plugin from "../../src/index";
import pkg from "../../package.json";

test("plugin: meta carries package name and version", () => {
  assert.deepEqual(plugin.meta, { name: pkg.name, version: pkg.version });
});

test("plugin: recommended config enables the rule with autofix", () => {
  const linter = new Linter();
  const config = plugin.configs.recommended as unknown as Linter.Config;
  const result = linter.verifyAndFix("const x = 1000000;", [config]);
  assert.equal(result.output, "const x = 1_000_000;");
});

test("plugin: recommended config references the plugin itself", () => {
  const plugins = plugin.configs.recommended.plugins as Record<
    string,
    ESLint.Plugin
  >;
  assert.equal(plugins["use-numeric-separator"], plugin);
});
