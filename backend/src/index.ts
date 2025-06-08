import "dotenv/config"; // loads .env
import app from "./server";

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
