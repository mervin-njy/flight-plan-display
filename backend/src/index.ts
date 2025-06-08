import "dotenv/config"; // loads .env
import app from "./server";

const PORT = process.env.PORT || 8888;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
