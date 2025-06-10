import "dotenv/config"; // loads .env
import app from "./server";
import { initGeopointCaches } from "./services/geopointCache";

const PORT = process.env.PORT;

async function startServer() {
  try {
    // Initialize geopoint caches
    await initGeopointCaches();
    console.log("Geopoint caches initialized successfully.");

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize server:", error);
    process.exit(1); // Exit with failure code
  }
}

startServer();
