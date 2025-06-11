import { getRouteElementsById } from "../services/routeService";
import * as flightManager from "../services/flightManager";
import * as geopointCache from "../services/geopointCache";
import { Flight } from "../models/Flight";

jest.mock("../services/flightManager");
jest.mock("../services/geopointCache");

describe("getRouteElementsById", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(geopointCache, "getCachedAirportCandidates")
      .mockImplementation((code: string) => {
        if (code === "DEP") {
          return [
            {
              designatedPoint: "DEP",
              lat: 50.0,
              lon: 50.0,
              type: "airport",
            },
          ];
        } else if (code === "UUDD") {
          return [
            {
              designatedPoint: "UUDD",
              lat: 55.41,
              lon: 37.91,
              type: "airport",
            },
          ];
        }
        return [];
      });
  });

  it("resolves a single candidate (FE)", async () => {
    const mockFlight: Flight = {
      _id: "f1",
      aircraftIdentification: "ABC123",
      filedRoute: {
        routeElement: [
          {
            seqNum: 1,
            position: { designatedPoint: "FE" },
            airway: "A1",
            airwayType: "ATS",
          },
        ],
      },
      departure: { departureAerodrome: "DEP" },
      arrival: { destinationAerodrome: "UUDD" },
    } as any;

    (flightManager.fetchFlights as jest.Mock).mockResolvedValue([mockFlight]);
    (geopointCache.getCachedGeopointCandidates as jest.Mock).mockReturnValue([
      { designatedPoint: "FE", lat: 41.83, lon: 12.35, type: "navaid" },
    ]);

    const result = await getRouteElementsById("f1");
    expect(result.length).toBe(1);
    expect(result[0].lat).toBeCloseTo(41.83);
    expect(result[0].lon).toBeCloseTo(12.35);
  });

  it("resolves fallback with departure only (URL)", async () => {
    const mockFlight: Flight = {
      _id: "f3",
      aircraftIdentification: "XYZ789",
      filedRoute: {
        routeElement: [
          {
            seqNum: 1,
            position: { designatedPoint: "URL" },
            airway: "B1",
            airwayType: "ATS",
          },
        ],
      },
      departure: { departureAerodrome: "DEP" },
      arrival: { destinationAerodrome: "UUDD" },
    } as any;

    (flightManager.fetchFlights as jest.Mock).mockResolvedValue([mockFlight]);
    (geopointCache.getCachedGeopointCandidates as jest.Mock).mockReturnValue([
      { designatedPoint: "URL", lat: 51.15, lon: 51.54, type: "navaid" },
    ]);

    const result = await getRouteElementsById("f3");
    expect(result.length).toBe(1);
    expect(result[0].designatedPoint).toBe("URL");
    expect(result[0].lat).toBeCloseTo(51.15);
  });

  it("ignores unresolved references (VIGOR)", async () => {
    const mockFlight: Flight = {
      _id: "f4",
      aircraftIdentification: "MNO321",
      filedRoute: {
        routeElement: [
          {
            seqNum: 1,
            position: { designatedPoint: "VIGOR" },
            airway: "C1",
            airwayType: "ATS",
          },
        ],
      },
      departure: { departureAerodrome: "DEP" },
      arrival: { destinationAerodrome: "UUDD" },
    } as any;

    (flightManager.fetchFlights as jest.Mock).mockResolvedValue([mockFlight]);
    (geopointCache.getCachedGeopointCandidates as jest.Mock).mockReturnValue(
      []
    );

    const result = await getRouteElementsById("f4");
    expect(result.length).toBe(1);
    expect(result[0].lat).toBeNull();
    expect(result[0].lon).toBeNull();
  });

  it("resolves proximity match: FE from URL, then AO from FE", async () => {
    const mockFlight: Flight = {
      _id: "f5",
      aircraftIdentification: "DEF456",
      filedRoute: {
        routeElement: [
          {
            seqNum: 1,
            position: { designatedPoint: "URL" },
            airway: "M166",
            airwayType: "ATS",
          },
          {
            seqNum: 2,
            position: { designatedPoint: "FE" },
            airway: "FE1D",
            airwayType: "ATS",
          },
          {
            seqNum: 3,
            position: { designatedPoint: "AO" },
            airway: "AO3B",
            airwayType: "ATS",
          },
        ],
      },
      departure: { departureAerodrome: "DEP" },
      arrival: { destinationAerodrome: "UUDD" },
    } as any;

    (flightManager.fetchFlights as jest.Mock).mockResolvedValue([mockFlight]);
    (geopointCache.getCachedGeopointCandidates as jest.Mock).mockImplementation(
      (code: string) => {
        if (code === "URL") {
          return [
            { designatedPoint: "URL", lat: 51.15, lon: 51.54, type: "navaid" },
          ];
        }
        if (code === "FE") {
          return [
            { designatedPoint: "FE", lat: 41.83, lon: 12.35, type: "navaid" },
            { designatedPoint: "FE", lat: 54.24, lon: 38.9, type: "navaid" },
            { designatedPoint: "FE", lat: 55.52, lon: 10.46, type: "navaid" },
          ];
        }
        if (code === "AO") {
          return [
            { designatedPoint: "AO", lat: 47.08, lon: 20.21, type: "navaid" },
            { designatedPoint: "AO", lat: 53.68, lon: 41.68, type: "navaid" },
            { designatedPoint: "AO", lat: 55.15, lon: 38.29, type: "navaid" },
          ];
        }
        return [];
      }
    );

    const result = await getRouteElementsById("f5");
    expect(result.length).toBe(3);
    expect(result[1].designatedPoint).toBe("FE");
    expect(result[1].lat).toBeCloseTo(54.24); // closest to URL
    expect(result[2].designatedPoint).toBe("AO");
    expect(result[2].lat).toBeCloseTo(55.15); // closest to FE
  });
});
