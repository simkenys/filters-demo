// server.js
import jsonServer from "json-server";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create JSON Server instance
const server = jsonServer.create();

// Path to your fake database
const dbFile = path.join(__dirname, "db.json");
const router = jsonServer.router(dbFile);

// Default middlewares (logger, static, CORS, etc.)
const middlewares = jsonServer.defaults();

// Enable CORS
server.use(cors());

// Use default middlewares
server.use(middlewares);

// Use JSON Server router
server.use(router);

// Start server
const PORT = 4000;
server.listen(PORT, () => {
  console.log(`JSON Server running at http://localhost:${PORT}`);
});
