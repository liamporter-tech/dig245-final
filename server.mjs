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
const DEFLOCK_INDEX_URL = "https://cdn.deflock.me/regions/index.json";
const DEFLOCK_INDEX_TTL_MS = 15 * 60 * 1000;
const DEFLOCK_TILE_TTL_MS = 60 * 60 * 1000;
const OVERPASS_RESULT_TTL_MS = 5 * 60 * 1000;
const deflockIndexCache = new Map();
const deflockIndexRequests = new Map();
const deflockTileCache = new Map();
const deflockTileRequests = new Map();
const overpassResultCache = new Map();
const overpassRequests = new Map();
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
// Intent: Cache shared upstream JSON responses in memory and reuse stale data if refresh fails.
async function getCachedJson({ cache, requests, key, url, ttl, label }) {
    const cached = cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return { data: cached.data, stale: false };
    }

    if (requests.has(key)) {
        return requests.get(key);
    }

    const refresh = (async () => {
        try {
            const response = await fetch(url, {
                headers: { "Accept": "application/json" },
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) {
                throw new Error(`${label} request failed (${response.status} ${response.statusText}).`);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error(`${label} returned a non-JSON response.`);
            }

            const data = await response.json();
            cache.set(key, { data, expiresAt: Date.now() + ttl });
            return { data, stale: false };
        } catch (error) {
            if (cached) {
                console.warn(`${label} refresh failed; serving cached data:`, error.message);
                return { data: cached.data, stale: true };
            }
            throw error;
        } finally {
            requests.delete(key);
        }
    })();

    requests.set(key, refresh);
    return refresh;
}

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
// Intent: Get and validate DeFlock's cached regional ALPR index before loading tiles.
async function getDeflockIndex() {
    const result = await getCachedJson({
        cache: deflockIndexCache,
        requests: deflockIndexRequests,
        key: DEFLOCK_INDEX_URL,
        url: DEFLOCK_INDEX_URL,
        ttl: DEFLOCK_INDEX_TTL_MS,
        label: "DeFlock data index"
    });
    const { data: index } = result;

    if (!Array.isArray(index.regions) || typeof index.tile_url !== "string"
        || !Number.isFinite(index.tile_size_degrees) || index.tile_size_degrees <= 0) {
        throw new Error("DeFlock returned an invalid regional data index.");
    }

    return {
        index,
        stale: result.stale || (Number.isFinite(index.expiration_utc)
            && index.expiration_utc * 1000 < Date.now())
    };
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Select DeFlock data tiles that intersect the requested radius.
function getTileKeys(area, tileSize) {
    const latitudeDelta = area.radius / 111320;
    const cosineLatitude = Math.max(Math.abs(Math.cos(area.lat * Math.PI / 180)), 0.01);
    const longitudeDelta = Math.min(180, area.radius / (111320 * cosineLatitude));
    const minimumLatitude = Math.max(-90, area.lat - latitudeDelta);
    const maximumLatitude = Math.min(90 - Number.EPSILON, area.lat + latitudeDelta);
    const minimumLongitude = area.lon - longitudeDelta;
    const maximumLongitude = area.lon + longitudeDelta;
    const keys = new Set();

    for (let tileLatitude = Math.floor(minimumLatitude / tileSize) * tileSize;
        tileLatitude <= Math.floor(maximumLatitude / tileSize) * tileSize;
        tileLatitude += tileSize) {
        for (let tileLongitude = Math.floor(minimumLongitude / tileSize) * tileSize;
            tileLongitude <= Math.floor(maximumLongitude / tileSize) * tileSize;
            tileLongitude += tileSize) {
            const wrappedLongitude = ((tileLongitude + 180) % 360 + 360) % 360 - 180;
            keys.add(`${tileLatitude}/${wrappedLongitude}`);
        }
    }

    return [...keys];
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Compute great-circle distance when filtering DeFlock's regional camera data.
function getDistanceMeters(firstLatitude, firstLongitude, secondLatitude, secondLongitude) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDifference = radians(secondLatitude - firstLatitude);
    const longitudeDifference = radians(secondLongitude - firstLongitude);
    const haversine = Math.sin(latitudeDifference / 2) ** 2
        + Math.cos(radians(firstLatitude)) * Math.cos(radians(secondLatitude))
        * Math.sin(longitudeDifference / 2) ** 2;

    return 6371000 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Load and cache relevant DeFlock tiles, then filter cached ALPRs by search radius.
async function getDeflockCameras(area) {
    const { index, stale: staleIndex } = await getDeflockIndex();
    const availableRegions = new Set(index.regions);
    const requestedRegions = getTileKeys(area, index.tile_size_degrees);
    const tileKeys = requestedRegions.filter((key) => availableRegions.has(key));

    if (tileKeys.length === 0) {
        throw new Error("DeFlock has no camera data for this area.");
    }

    const tileResults = await Promise.all(tileKeys.map(async (key) => {
        const [lat, lon] = key.split("/");
        const tileUrl = index.tile_url.replace("{lat}", lat).replace("{lon}", lon);
        const result = await getCachedJson({
            cache: deflockTileCache,
            requests: deflockTileRequests,
            key: tileUrl,
            url: tileUrl,
            ttl: DEFLOCK_TILE_TTL_MS,
            label: `DeFlock tile ${key}`
        });

        if (!Array.isArray(result.data)) {
            throw new Error(`DeFlock tile ${key} returned an invalid response.`);
        }
        return result;
    }));

    const cameras = tileResults.flatMap(({ data }) => data)
        .filter((camera) => Number.isFinite(Number(camera.lat)) && Number.isFinite(Number(camera.lon))
            && getDistanceMeters(area.lat, area.lon, Number(camera.lat), Number(camera.lon)) <= area.radius)
        .map((camera) => ({
            type: "node",
            id: camera.id,
            lat: Number(camera.lat),
            lon: Number(camera.lon),
            tags: {
                ...camera.tags,
                "surveillance:type": camera.tags?.["surveillance:type"] || "ALPR"
            }
        }));

    const versionTimestamp = Number(new URL(index.tile_url).searchParams.get("v"));
    return {
        elements: cameras,
        source: "deflock",
        stale: staleIndex || tileResults.some((result) => result.stale),
        dataAsOf: Number.isFinite(versionTimestamp)
            ? new Date(versionTimestamp * 1000).toISOString()
            : null,
        uncoveredRegions: requestedRegions.length - tileKeys.length
    };
}

// [AI-Generated: Copilot | 2026-11-10]
// Intent: Prefer DeFlock's cache, then reuse recent Overpass results before querying upstream.
async function getCameraData(area) {
    try {
        return await getDeflockCameras(area);
    } catch (error) {
        console.warn("DeFlock data unavailable; falling back to Overpass:", error.message);
    }

    const cacheKey = `${area.lat.toFixed(5)}:${area.lon.toFixed(5)}:${area.radius}`;
    const query = `[out:json][timeout:35];
(
  nwr["man_made"="surveillance"]["surveillance:type"~"^(ALPR|ANPR)$",i](around:${area.radius},${area.lat},${area.lon});
);
out center tags;`;
    const cached = overpassResultCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
        return { ...cached.data, cached: true };
    }
    if (overpassRequests.has(cacheKey)) {
        return overpassRequests.get(cacheKey);
    }

    const refresh = requestOverpass(query)
        .then((data) => {
            const result = { ...data, source: "overpass", cached: false };
            overpassResultCache.set(cacheKey, {
                data: result,
                expiresAt: Date.now() + OVERPASS_RESULT_TTL_MS
            });
            return result;
        })
        .catch((error) => {
            if (cached) {
                console.warn("Overpass refresh failed; serving previously cached results:", error.message);
                return { ...cached.data, cached: true, stale: true };
            }
            throw error;
        })
        .finally(() => overpassRequests.delete(cacheKey));
    overpassRequests.set(cacheKey, refresh);
    return refresh;
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

    try {
        const data = await getCameraData(area);
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
