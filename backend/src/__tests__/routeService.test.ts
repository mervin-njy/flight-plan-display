import { getRouteElementsById } from "../services/routeService";
import * as flightManager from "../services/flightManager";
import * as geopointCache from "../services/geopointCache";

jest.mock("../services/flightManager");
jest.mock("../services/geopointCache");

describe("getRouteElementsById", () => {
  const mockFlight = {
    _id: "FL123",
    aircraftIdentification: "FL123",
    filedRoute: {
      routeElement: [
        {
          position: { designatedPoint: "CHI" },
          seqNum: 0,
          airway: "G1",
          airwayType: "NAMED",
        },
      ],
    },
    departure: { departureAerodrome: "WSSS" },
    arrival: { destinationAerodrome: "UUDD" },
  };

  beforeEach(() => {
    (flightManager.fetchFlights as jest.Mock).mockResolvedValue([mockFlight]);
    (geopointCache.getResolvedGeopointCandidate as jest.Mock).mockReturnValue({
      designatedPoint: "CHI",
      lat: 1.1,
      lon: 1.1,
      type: "fix",
    });
    (geopointCache.getCachedGeopointCandidates as jest.Mock).mockReturnValue([
      { designatedPoint: "CHI", lat: 1.1, lon: 1.1, type: "fix" },
      { designatedPoint: "CHI", lat: 2.2, lon: 2.2, type: "fix" },
      { designatedPoint: "CHI", lat: 3.3, lon: 3.3, type: "fix" },
    ]);
    (geopointCache.getCachedAirportCandidates as jest.Mock).mockImplementation(
      (code) => {
        if (code === "WSSS")
          return [
            { designatedPoint: "WSSS", lat: 1.1, lon: 103.9, type: "airport" },
          ];
        if (code === "UUDD")
          return [
            { designatedPoint: "UUDD", lat: 55.5, lon: 37.5, type: "airport" },
          ];
        return null;
      }
    );
  });

  it("resolves multiple geopoint candidates using proximity logic", async () => {
    const result = await getRouteElementsById("FL123");
    expect(result.length).toBe(1);
    expect(result[0].designatedPoint).toBe("CHI");
    expect(result[0].lat).toBeCloseTo(1.1); // the mocked closest point
  });
});
