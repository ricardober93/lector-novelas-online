import { describe, it, expect } from "vitest";
import { normalizeReadingHistory } from "./historyNormalizer";

describe("normalizeReadingHistory", () => {
  it("returns empty array for null input", () => {
    const out = normalizeReadingHistory(null);
    expect(out).toEqual([]);
  });

  it("handles plain array input", () => {
    const arr = [{ id: '1', chapter: { id: 'c1', number: 1, volume: { number: 1, series: { id: 's1', title: 'Series' } }, }, lastPage: 1, progress: 10, updatedAt: '' } as any];
    const out = normalizeReadingHistory(arr as any);
    expect(out).toEqual(arr);
  });

  it("extracts from wrapper.history", () => {
    const wrapper = { history: [{ id: 'h1', chapter: { id: 'c2', number: 2, volume: { number: 2, series: { id: 's2', title: 'Series 2' } }, }, lastPage: 2, progress: 20, updatedAt: '' }] } as any;
    const out = normalizeReadingHistory(wrapper);
    expect(out.length).toBeGreaterThan(0);
  });

  it("extracts from wrapper.data", () => {
    const wrapper = { data: [{ id: 'h2', chapter: { id: 'c3', number: 3, volume: { number: 3, series: { id: 's3', title: 'Series 3' } }, }, lastPage: 3, progress: 30, updatedAt: '' }] } as any;
    const out = normalizeReadingHistory(wrapper);
    expect(out.length).toBeGreaterThan(0);
  });
});
