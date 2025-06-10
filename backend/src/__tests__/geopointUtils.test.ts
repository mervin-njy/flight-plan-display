import {
  haversineDistance,
  resolveDuplicateByProximity,
} from "../utils/geopointUtils";

describe("haversineDistance", () => {
  it("returns ~60NM for 1° longitude at equator", () => {
    const a = { lat: 0, lon: 0 };
    const b = { lat: 0, lon: 1 };
    expect(haversineDistance(a, b)).toBeCloseTo(60, 0);
  });

  it("returns 0 for identical points", () => {
    const a = { lat: 51.5, lon: -0.1 };
    expect(haversineDistance(a, a)).toBeCloseTo(0);
  });
});

describe("resolveDuplicateByProximity", () => {
  const reference = { lat: 0, lon: 0 };

  it("returns closest of 2 points", () => {
    const candidates = [
      { lat: 1, lon: 1 },
      { lat: 0.5, lon: 0.5 },
    ];
    const result = resolveDuplicateByProximity(candidates, reference);
    expect(result).toEqual({ lat: 0.5, lon: 0.5 });
  });

  it("returns closest from multiple ambiguous entries", () => {
    const candidates = [
      { lat: 30.1, lon: 30.1 },
      { lat: 31.0, lon: 31.0 },
      { lat: 30.0, lon: 30.0 },
      { lat: 29.9, lon: 29.9 },
      { lat: 40.0, lon: 40.0 },
    ];
    const ref = { lat: 30.0, lon: 30.0 };
    const result = resolveDuplicateByProximity(candidates, ref);
    expect(result).toEqual({ lat: 30.0, lon: 30.0 });
  });

  it("returns null for empty candidate list", () => {
    const result = resolveDuplicateByProximity([], reference);
    expect(result).toBeNull();
  });

  it("returns null when reference is null", () => {
    const result = resolveDuplicateByProximity([{ lat: 10, lon: 10 }], null);
    expect(result).toBeNull();
  });
});
