// src/server.ts
import app from "./app";
import { env } from "./config/env";
import { testDbConnection } from "./config/db";

async function bootstrap() {
  await testDbConnection();

  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});