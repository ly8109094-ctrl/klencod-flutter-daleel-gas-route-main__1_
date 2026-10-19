import { describe, it, expect } from "vitest";
import { normalizeName } from "@/lib/data";
const base = normalizeName("محمد علي ناصر احمد");
describe("duplicate names", () => {
  it("ignores diacritics", () => expect(normalizeName("محمد علي ناصِر احمد")).toBe(base));
  it("ignores doubled letters", () => expect(normalizeName("محممد علي ناصر احمد")).toBe(base));
  it("ignores spaces and symbols", () => expect(normalizeName("  محمد  علي.ناصر  أحمد ")).toBe(base));
  it("different names differ", () => expect(normalizeName("محمد علي ناصر سالم")).not.toBe(base));
});
