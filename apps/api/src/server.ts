import { createApp } from "./app.js";
import { config } from "./config.js";

const app = createApp();

app.listen(config.API_PORT, () => {
  console.log(`EMS API running on http://localhost:${config.API_PORT}`);
  console.log(`API docs available at http://localhost:${config.API_PORT}/api/docs`);
});
