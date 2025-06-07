import "dotenv/config"; // loads .env
import app from "./server";

const PORT = process.env.PORT || 6666;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
