# Flight Plan Display

## Overview

This project visualizes historical aviation flight paths, resolving waypoints and displaying them on an interactive map using real-world fix/navaid data.

The MVP focuses on data enrichment and visualization, handling real-world inconsistencies such as duplicate or missing fix names, and caching resolved coordinates to improve performance. This demonstrates a full CI/CD process, including containerization, testing and deployment.

[Live deployment](http://ec2-13-238-128-63.ap-southeast-2.compute.amazonaws.com:3000/) can be accessed here.

![github QR](./images/githubQR.svg)
![webapp QR](./images/webappQR.svg)

---

## Features

- Flight selection by callsign search and timestamp
- Route rendering with:
  - SID / STAR (tagged, with missing coordinates)
  - Departure and Arrival markers
  - Fixes vs Navaids
  - Handles missing points
- Air routes tabulation

---

## Architecture

![Architecture Diagram](./images/architecture.svg)

---

### System Flow Overview

- **Backend (on startup)**: Initializes `geopointCache` by pre-fetching available fixes and navaids from the upstream API.
- **Frontend (on mount)**: Fetches flights and airways data for selection.
- **Flight Selection**:
  - Filters flights by unique callsign
  - Displays flight objects with timestamps
  - On selection, queries backend for resolved route
- **Route Resolution (Backend)**:
  - Retrieves `routeElements` using flight ID
  - Appends departure and arrival points to form full route
  - Resolves each waypoint's coordinates from cache or upstream fallback
  - Uses previous resolved context to select closest coordinate amongst repeated geopoint names
- **Rendering (Frontend)**:
  - Circle markers and popups for each valid point
  - Lines for valid segments
  - Table listing of parsed `waypoints`

---

### CI/CD

- Upon push/commit triggers 2 workflows:
  - Run unit tests (backend only for now)
  - Build Docker images (frontend + backend)
- Images are pushed to GHCR (GitHub Container Registry)
- Production server can pull and run via `docker-compose.prod.yml`
- Technically they should be done one after the other, but unit tests are still being written.

---

## How to Run

1. **Clone & Setup:**

   ```bash
   git clone https://github.com/mervin-njy/flight-plan-display
   cd flight-plan-display
   ```

2. **Create .env Files:**

   - `./frontend/.env`:

     ```
     VITE_API_BASE_URL=http://localhost:8888/api
     ```

   - `./backend/.env`:

     ```
     PORT=8888
     API_URI=<your-upstream-api-url>
     API_KEY=<your-api-key>
     ```

3. **Build + Run Locally:**

   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

   - To stop:
     ```bash
     docker-compose down
     ```
   - To check images:
     ```bash
     docker images
     ```

4. **Access App:**

   ```
   http://localhost:3000
   ```

5. **Run Tests (Backend):**

   ```bash
   cd backend
   npm run test
   ```

---

## Key challenges

### Query Methodology

- **Initial**: Serial queries to `/exist/:type/:code` then `/search/:type/:code`
- **Problem**: Inefficient, slow and error prone
- **Current**: Preload all known geopoints into memory cache
- **Fallback**: On-demand query + cache update
- **Planned**: TTL or Redis persistence for shared scaling

### Resolving Non-Unique Waypoints

- **Initial**: Pick first result blindly
- **Problem**: Ambiguous coordinates, especially common fix names
- **Current**: Use context of previous valid fix to disambiguate (iterative backward check)
- **Planned**: Proximity-based scoring logic

### Build & CI/CD Challenges

- Docker build conflicting with vite preview paths (fixed via relative path tweaks)
- GH Actions GHCR image visibility and cache handling

---

## Summary of takeaways

- Caching strategies (in-memory + TTL)
- Geospatial enrichment and route parsing logic
- Frontend mapping with Leaflet.js
- Docker containerization
- CI/CD automation with GitHub Actions
- Backend testing via Jest
- AWS EC2 deployment using Docker Compose

---

## Future work - what 1 more week will be like

- Expand test coverage (API + route logic)
- Redis-based persistent caching layer
- Improved fix disambiguation via geo proximity
- Alternate route suggestion via A\* search or fallback mapping

---

## Further Questions

- Are there better ways to handle partial or missing coordinate chains?
- Any suggestions/best practices to make the best use of Airways?
- Any testing libraries or coverage metrics you'd recommend?
