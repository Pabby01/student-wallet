// Vercel Node.js serverless function — bridges the fetch-style SSR handler
// built by TanStack Start into a standard Vercel request/response function.
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

// The compiled SSR entry exports { default: { fetch(req, env, ctx) } }
const __dirname = dirname(fileURLToPath(import.meta.url));
const serverEntryPath = join(__dirname, "../dist/server/server.js");

let _handler;
async function getHandler() {
  if (!_handler) {
    const mod = await import(serverEntryPath);
    _handler = (mod.default ?? mod).fetch.bind(mod.default ?? mod);
  }
  return _handler;
}

export default async function vercelHandler(req, res) {
  const fetch = await getHandler();

  // Build the full URL from Vercel's forwarded headers
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["host"] ?? "localhost";
  const url = new URL(req.url, `${proto}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value == null) continue;
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else headers.set(key, value);
  }

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody
    ? new ReadableStream({
        start(ctrl) {
          req.on("data", (c) => ctrl.enqueue(c));
          req.on("end", () => ctrl.close());
          req.on("error", (e) => ctrl.error(e));
        },
      })
    : undefined;

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
    // Required for body streams in Node 18+
    ...(hasBody ? { duplex: "half" } : {}),
  });

  const response = await fetch(request, process.env, {});

  res.statusCode = response.status;
  for (const [key, value] of response.headers.entries()) {
    res.setHeader(key, value);
  }

  if (response.body) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}
