export interface Flight {
  _id: string;
  messageType: string; // Type of message (e.g., "FPL" for flight plan)
  aircraftIdentification: string; // Flight callsign or registration identifier for air-ground comms
  flightType: string; // Flight category (e.g., "S" for scheduled)
  aircraftOperating: string; // Identity of a person, organization or enterprise engaged in or offering to engage in aircraft operation
  flightPlanOriginator: string; // Originator of the flight plan (e.g., "AFTN" or "ATC")
  remark: string;
  receptionTime: string;
  src: string;
  lastUpdatedTimeStamp: string;
  gufi: string; // Globally unique flight identifier
  gufiOriginator: string; // Originator of the GUFI, can be FF-ICE participant or an ASP (Air Service Provider)

  aircraft: Aircraft;
  departure: Departure;
  arrival: Arrival;
  filedRoute: FiledRoute;
  enroute: Enroute;
}

export interface FiledRoute {
  flightRuleCategory: string;
  cruisingSpeed: string; // what does
  cruisingLevel: string;
  routeText: string;
  routeElement: RouteElement[];
  totalEstimatedElapsedTime: string;
  otherEstimatedElapsedTime: string[];
}

export interface RouteElement {
  seqNum: number; // sequence number of way point
  position: { designatedPoint: string }; // to retrieve lat lon from fixes / navaids
  airway?: string; // Airways are corridors 10 nautical miles (19 km) wide of controlled airspace with a defined lower base
  airwayType: string;
  changeLevel?: string; // e.g., "350 F" for flight level 350 / 35000 feet
  changeSpeed?: string; // in M, K or N (will just display as is)
}

export interface Aircraft {
  aircraftType: string;
  wakeTurbulence: string;
  standardCapabilities: string;
  surveillanceCapabilitiesCodes: string[];
  aircraftRegistration: string;
  aircraftAddress: string;
  otherSurveillanceCapabilities: string;
  aircraftApproachCategory: string;
  communication: Communication;
  navigation: Navigation;
}

export interface Communication {
  communicationCapabilityCode: string[];
  dataLinkCapabilityCode: string[];
  otherDataLinkCapabilities: string;
  selectiveCallingCode: string;
}

export interface Navigation {
  navigationCapabilitiesCode: string[];
  performanceBasedCode: string[];
  otherNavigationCapabilities: string;
}

export interface Departure {
  departureAerodrome: string;
  estimatedOffBLockTime: string;
  dateOfFlight: string;
  timeOfFlight: number;
}

export interface Arrival {
  destinationAerodrome: string;
  alternativeAerodrome: string[];
  timeOfArrival: number;
}

export interface Enroute {
  alternativeEnRouteAerodrome: string;
  currentModeACode: string;
}
