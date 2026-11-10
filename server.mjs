// [AI-Generated: Copilot | 2026-11-10]
// Intent: Serve the app and provide its same-origin API for live Overpass searches.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const PROJECT_ROOT = path.dirname(fileURLToPath(import.meta.url));
const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.private.coffee/api/interpreter"
];
const STATIC_CONTENT_TYPES = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".png": "image/png",
    ".webp": "image/webp"
};

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Send JSON API responses with explicit cache and content-type headers.
function sendJson(response, statusCode, data) {
    response.writeHead(statusCode, {
        "Cache-Control": "no-store",
        "Content-Type": "application/json; charset=utf-8"
    });
    response.end(JSON.stringify(data));
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Validate coordinate and radius inputs before constructing an Overpass query.
function getSearchArea(url) {
    const latitudeValue = url.searchParams.get("lat");
    const longitudeValue = url.searchParams.get("lon");
    const radiusValue = url.searchParams.get("radius");
    const lat = Number(latitudeValue);
    const lon = Number(longitudeValue);
    const radius = Number(radiusValue);

    if (latitudeValue === null || !latitudeValue.trim() || !Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new Error("Latitude must be between -90 and 90.");
    }
    if (longitudeValue === null || !longitudeValue.trim() || !Number.isFinite(lon) || lon < -180 || lon > 180) {
        throw new Error("Longitude must be between -180 and 180.");
    }
    if (radiusValue === null || !radiusValue.trim() || !Number.isFinite(radius) || radius < 100 || radius > 25000) {
        throw new Error("Radius must be between 100 and 25,000 meters.");
    }

    return { lat, lon, radius };
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Query backup Overpass instances server-side and report useful upstream errors.
async function requestOverpass(query) {
    const failures = [];

    for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                    "User-Agent": "DIG245-ALPR-Prototype/1.0"
                },
                body: new URLSearchParams({ data: query }),
                signal: AbortSignal.timeout(40000)
            });

            if (!response.ok) {
                failures.push(`${new URL(endpoint).hostname}: HTTP ${response.status} ${response.statusText}`.trim());
                continue;
            }

            const data = await response.json();
            if (!Array.isArray(data.elements)) {
                failures.push(`${new URL(endpoint).hostname}: invalid Overpass response`);
                continue;
            }
            return data;
        } catch (error) {
            const reason = error.name === "TimeoutError" || error.name === "AbortError"
                ? "request timed out"
                : error.message;
            failures.push(`${new URL(endpoint).hostname}: ${reason}`);
        }
    }

    console.error("All Overpass requests failed:", failures.join("; "));
    throw new Error("All Overpass servers are unavailable or timed out. Please try again in a moment.");
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Validate and handle nearby camera searches through the same-origin API.
async function handleCameraSearch(url, response) {
    let area;
    try {
        area = getSearchArea(url);
    } catch (error) {
        sendJson(response, 400, { error: error.message });
        return;
    }

    const query = `[out:json][timeout:35];
(
  nwr["man_made"="surveillance"]["surveillance:type"~"^(ALPR|ANPR)$",i](around:${area.radius},${area.lat},${area.lon});
);
out center tags;`;

    try {
        const data = await requestOverpass(query);
        sendJson(response, 200, data);
    } catch (error) {
        sendJson(response, 503, { error: error.message });
    }
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Serve the app's public HTML, JavaScript, CSS, and image assets.
async function serveStaticFile(url, response, method) {
    let pathname;
    try {
        pathname = decodeURIComponent(url.pathname);
    } catch {
        sendJson(response, 400, { error: "Invalid URL path." });
        return;
    }

    if (pathname === "/") {
        pathname = "/index.html";
    }
    if (pathname !== "/index.html" && !pathname.startsWith("/assets/")) {
        sendJson(response, 404, { error: "Not found." });
        return;
    }

    const filePath = path.resolve(PROJECT_ROOT, `.${pathname}`);
    if (!filePath.startsWith(`${PROJECT_ROOT}${path.sep}`)) {
        sendJson(response, 404, { error: "Not found." });
        return;
    }

    const contentType = STATIC_CONTENT_TYPES[path.extname(filePath).toLowerCase()];
    if (!contentType) {
        sendJson(response, 404, { error: "Not found." });
        return;
    }

    try {
        const content = await readFile(filePath);
        response.writeHead(200, {
            "Cache-Control": "no-cache",
            "Content-Type": contentType,
            "X-Content-Type-Options": "nosniff"
        });
        response.end(method === "HEAD" ? undefined : content);
    } catch (error) {
        if (error.code === "ENOENT" || error.code === "EISDIR") {
            sendJson(response, 404, { error: "Not found." });
            return;
        }
        console.error(`Could not serve ${pathname}:`, error);
        sendJson(response, 500, { error: "Could not read the requested file." });
    }
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Route the same-origin camera API and static page requests.
const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);

    if (url.pathname === "/api/cameras") {
        if (request.method !== "GET") {
            response.setHeader("Allow", "GET");
            sendJson(response, 405, { error: "Method not allowed." });
            return;
        }
        await handleCameraSearch(url, response);
        return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        response.setHeader("Allow", "GET, HEAD");
        sendJson(response, 405, { error: "Method not allowed." });
        return;
    }
    await serveStaticFile(url, response, request.method);
});

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Start the local app server and report startup failures explicitly.
if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
}

server.listen(PORT, HOST, () => {
    console.log(`App and Overpass API proxy running at http://${HOST}:${PORT}`);
});

server.on("error", (error) => {
    console.error("Could not start the app server:", error);
    process.exitCode = 1;
});
