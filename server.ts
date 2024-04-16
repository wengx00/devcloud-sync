import chokidar from "chokidar";
import chalk from "chalk";
import WebSocket from "ws";

const rootPath = process.argv[2];

const history = new Set<string>();

if (!rootPath) {
  console.log(chalk.red("Please provide a root path to watch"));
  process.exit(1);
}

const wss = new WebSocket.Server({ port: 8001 }, () => {
  console.log(
    chalk.green("WebSocket Server is running on port"),
    chalk.blue(wss.options.port)
  );
});

const wsPool = new Set<WebSocket>();

wss.on("connection", (ws) => {
  wsPool.add(ws);
  // 同步历史改动
  history.forEach((path) => {
    ws.send(path);
  });

  ws.on("close", () => {
    wsPool.delete(ws);
  });
});

const onChange = (rawPath: string) => {
  const path = rawPath.slice(rootPath.length).replace(/\\/g, "/");
  console.log(
    chalk.grey("[Watcher]"),
    chalk.grey("Change detected in"),
    chalk.yellow(path)
  );
  history.add(path);
  wsPool.forEach((ws) => {
    ws.send(path);
  });
};

chokidar
  .watch(rootPath, {
    persistent: true,
    ignoreInitial: false,
    usePolling: false,
    depth: 99,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100,
    },
    atomic: true,
  })
  .on("ready", () => {
    console.log(
      chalk.grey("[Watcher]"),
      "Watching for changes in",
      chalk.green(rootPath)
    );
  })
  .on("change", onChange);
