import { loadRootEnv } from "./lib/load-env";
import app from "./app";
import { logger } from "./lib/logger";

loadRootEnv();

const rawPort = process.env["PORT"];
const isReplit = process.env.REPL_ID !== undefined;
const port = Number(rawPort ?? 8080);

if (isReplit && !rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort ?? "8080"}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
