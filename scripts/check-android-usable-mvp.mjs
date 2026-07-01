import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve, sep } from "node:path";
import { spawn } from "node:child_process";

const rootDir = process.cwd();
const distDir = resolve(rootDir, "apps/mobile/dist");
let server;

try {
  await run("npx", ["tsc", "--noEmit", "-p", "apps/mobile/tsconfig.json"]);
  await run("npm", ["run", "check:shared"]);
  await run("npm", ["run", "check:android-product-quality"]);
  await run("npm", ["run", "check:android-preview-preflight"]);
  await run("npm", ["run", "export:android-web"]);
  await run("npm", ["run", "check:android-web-export"]);

  server = await startStaticServer(distDir);
  const previewUrl = `http://127.0.0.1:${server.address().port}/`;
  await run("npm", ["run", "check:android-core-flow"], { WEATHERON_WEB_PREVIEW_URL: previewUrl });
  await run("npm", ["run", "check:android-small-screen-layout"], { WEATHERON_WEB_PREVIEW_URL: previewUrl });

  console.log("android usable MVP check passed");
} finally {
  if (server) await closeServer(server);
}

function run(command, args, extraEnv = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      env: { ...process.env, ...extraEnv },
      stdio: "inherit",
    });
    child.on("error", rejectRun);
    child.on("exit", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

function startStaticServer(root) {
  if (!existsSync(join(root, "index.html"))) {
    throw new Error("apps/mobile/dist/index.html missing: run npm run export:android-web first");
  }

  const serverInstance = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(requestUrl.pathname);
    const filePath = getSafeFilePath(root, pathname);
    if (!filePath) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }
    const resolvedPath = existsSync(filePath) && statSync(filePath).isFile() ? filePath : join(root, "index.html");
    response.writeHead(200, { "Content-Type": contentType(resolvedPath) });
    createReadStream(resolvedPath).pipe(response);
  });

  return new Promise((resolveStart, rejectStart) => {
    serverInstance.on("error", rejectStart);
    serverInstance.listen(0, "127.0.0.1", () => resolveStart(serverInstance));
  });
}

function getSafeFilePath(root, pathname) {
  const normalizedPath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const resolvedPath = resolve(root, `.${sep}${normalizedPath}`);
  return resolvedPath.startsWith(root) ? resolvedPath : null;
}

function contentType(filePath) {
  const extension = extname(filePath);
  if (extension === ".html") return "text/html; charset=utf-8";
  if (extension === ".js") return "application/javascript; charset=utf-8";
  if (extension === ".css") return "text/css; charset=utf-8";
  if (extension === ".png") return "image/png";
  if (extension === ".ico") return "image/x-icon";
  if (extension === ".json") return "application/json; charset=utf-8";
  return "application/octet-stream";
}

function closeServer(serverInstance) {
  return new Promise((resolveClose, rejectClose) => {
    serverInstance.close((error) => {
      if (error) rejectClose(error);
      else resolveClose();
    });
  });
}
