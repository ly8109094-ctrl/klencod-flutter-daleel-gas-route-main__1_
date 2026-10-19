import { describe, expect, it } from "vitest";
import { agentSummary, computeRemaining, initialState, toPublicDelivery, canDeleteBatch } from "@/lib/data";

describe("business rules", () => {
  it('deletion requires archived batch and exact code confirmation', () => {
    const batch = {id:'test',code:'دفعة-1',createdAt:'2026-10-15',totalCylinders:10,status:'archived' as const};
    expect(canDeleteBatch(batch, 'دفعة-1')).toBe(true);
    expect(canDeleteBatch(batch, 'wrong')).toBe(false);
    expect(canDeleteBatch({...batch,status:'open'}, 'دفعة-1')).toBe(false);
  });
  it("remaining = received - approved deliveries + adjustments", () => {
    expect(computeRemaining(350, 200, -4)).toBe(146);
  });
  it("pending deliveries do not reduce remaining", () => {
    // a2 batch b2: 400 received, 150 approved, 1 pending
    expect(agentSummary(initialState, "a2", "b2").remaining).toBe(250);
  });
  it("public deliveries never include citizen ID", () => {
    const delivery = initialState.deliveries[0];
    if (!delivery) throw new Error('Missing test fixture');
    const p = toPublicDelivery({ ...delivery, citizenId: "123" });
    expect("citizenId" in p).toBe(false);
  });
  it("citizen ID collection is off by default", () => {
    expect(initialState.settings.collectCitizenId).toBe(false);
  });
  it('public projection exposes no phone or private fields', () => {
    const delivery = initialState.deliveries[0];
    if (!delivery) throw new Error('Missing test fixture');
    expect(Object.keys(toPublicDelivery(delivery)).sort()).toEqual(['date','id','quantity','recipientName']);
  });
});
