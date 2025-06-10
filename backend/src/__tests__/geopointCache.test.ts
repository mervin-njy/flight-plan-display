import { getResolvedGeopointCandidate } from "../services/geopointCache";
import { fixesLookup } from "../services/geopointCache";

describe("getResolvedGeopointCandidate", () => {
  beforeEach(() => {
    fixesLookup["TEST"] = [
      { designatedPoint: "TEST", lat: 1, lon: 1, type: "fix" },
      { designatedPoint: "TEST", lat: 2, lon: 2, type: "fix" },
      { designatedPoint: "TEST", lat: 0, lon: 0, type: "fix" },
    ];
  });

  it("returns closest match by proximity", () => {
    const ref = { lat: 0.1, lon: 0.1 };
    const result = getResolvedGeopointCandidate("TEST", "fixes", ref);
    expect(result?.lat).toBe(0);
    expect(result?.lon).toBe(0);
  });

  it("returns the first match when no reference", () => {
    const result = getResolvedGeopointCandidate("TEST", "fixes", null);
    expect(result?.lat).toBe(1);
    expect(result?.lon).toBe(1);
  });

  it("returns null when no candidates found", () => {
    const result = getResolvedGeopointCandidate("UNKNOWN", "fixes", null);
    expect(result).toBeNull();
  });
});
