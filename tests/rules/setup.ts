import { RuleTester } from "@typescript-eslint/rule-tester";
import * as nodeTest from "node:test";

// Wire RuleTester to node:test's describe/it so it works without mocha.
RuleTester.afterAll = nodeTest.after;
RuleTester.describe = nodeTest.describe;
RuleTester.it = nodeTest.it;
RuleTester.itOnly = nodeTest.it.only;

export function makeRuleTester(): RuleTester {
  return new RuleTester();
}
