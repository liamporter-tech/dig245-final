// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Request nearby ALPR locations from the Node API and render them safely.
const searchForm = document.getElementById("camera-search");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const radiusInput = document.getElementById("radius");
const statusMessage = document.getElementById("api-status");
const resultsList = document.getElementById("camera-results");
const locationButton = document.getElementById("use-location");

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Update the accessible status message during searches.
function setStatus(message) {
    statusMessage.textContent = message;
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Display returned OSM camera data without inserting untrusted HTML.
function renderCamera(camera) {
    const coordinates = camera.lat !== undefined && camera.lon !== undefined
        ? { lat: camera.lat, lon: camera.lon }
        : camera.center;

    if (!coordinates) {
        return null;
    }

    const item = document.createElement("li");
    const title = document.createElement("h3");
    const details = document.createElement("p");
    const mapLink = document.createElement("a");
    const tags = camera.tags || {};
    const cameraType = tags["surveillance:type"] || "ALPR/ANPR";
    const elementType = camera.type || "node";
    const cameraName = tags.name || tags.operator || tags.manufacturer
        || `${cameraType} camera (${elementType} ${camera.id})`;

    title.textContent = cameraName;
    details.textContent = `${cameraType} | ${Number(coordinates.lat).toFixed(5)}, ${Number(coordinates.lon).toFixed(5)}`;
    mapLink.href = `https://www.openstreetmap.org/${encodeURIComponent(elementType)}/${encodeURIComponent(camera.id)}`;
    mapLink.textContent = "View on OpenStreetMap";
    mapLink.target = "_blank";
    mapLink.rel = "noopener noreferrer";

    item.append(title, details, mapLink);
    return item;
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Render API results as an accessible list, including a clear empty state.
function renderResults(cameras) {
    resultsList.replaceChildren();
    let renderedCount = 0;

    cameras.forEach((camera) => {
        const item = renderCamera(camera);
        if (item) {
            resultsList.append(item);
            renderedCount += 1;
        }
    });

    if (renderedCount === 0) {
        const emptyResult = document.createElement("li");
        emptyResult.textContent = "No mapped ALPR/ANPR cameras were found in this area.";
        resultsList.append(emptyResult);
    }

    return renderedCount;
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Validate the user's search area before calling the API.
function getSearchArea() {
    if (!latitudeInput.value.trim() || !longitudeInput.value.trim()) {
        throw new Error("Enter both latitude and longitude coordinates.");
    }

    const lat = Number(latitudeInput.value);
    const lon = Number(longitudeInput.value);
    const radius = Number(radiusInput.value);

    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new Error("Enter a latitude between -90 and 90.");
    }
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
        throw new Error("Enter a longitude between -180 and 180.");
    }
    if (!Number.isFinite(radius) || radius < 100 || radius > 25000) {
        throw new Error("Enter a search radius between 100 and 25,000 meters.");
    }

    return { lat, lon, radius };
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Fetch live nearby ALPR/ANPR locations through the same-origin Node API.
async function searchCameras() {
    let area;
    try {
        area = getSearchArea();
    } catch (error) {
        setStatus(error.message);
        return;
    }

    const params = new URLSearchParams({
        lat: area.lat,
        lon: area.lon,
        radius: area.radius
    });

    resultsList.replaceChildren();
    setStatus("Checking DeFlock's cached camera data first...");
    searchForm.querySelector('button[type="submit"]').disabled = true;

    try {
        const response = await fetch(`/api/cameras?${params}`);
        const contentType = response.headers.get("content-type") || "";
        if (!contentType.includes("application/json")) {
            throw new Error("The camera API returned a web page instead of JSON. Check your API server URL and deployment.");
        }
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Camera search failed (${response.status}).`);
        }
        if (!Array.isArray(data.elements)) {
            throw new Error("The camera API returned an unexpected response.");
        }

        const cameraCount = renderResults(data.elements);
        const cameraLabel = cameraCount === 1 ? "camera" : "cameras";
        const sourceNote = data.source === "deflock"
            ? ` Using DeFlock's cached data${data.dataAsOf ? ` last updated ${new Date(data.dataAsOf).toLocaleDateString()}` : ""}${data.stale ? "; it may be out of date" : ""}.`
            : data.cached
                ? " Served from the recent local cache."
                : " Retrieved from Overpass.";
        const coverageNote = data.uncoveredRegions > 0
            ? ` ${data.uncoveredRegions} surrounding region(s) are not available in DeFlock's data.`
            : "";
        setStatus(`Found ${cameraCount} mapped ${cameraLabel} within ${area.radius.toLocaleString()} meters.${sourceNote}${coverageNote}`);
    } catch (error) {
        console.error("Could not retrieve OpenStreetMap camera data:", error);
        const message = error instanceof TypeError && error.message === "Failed to fetch"
            ? "Cannot reach the Node API. Start it with `node server.mjs` and open http://127.0.0.1:3000."
            : error.message;
        setStatus(`Could not load camera data: ${message}`);
    } finally {
        searchForm.querySelector('button[type="submit"]').disabled = false;
    }
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Handle explicit user requests to search with browser-provided location.
function searchAtCurrentLocation() {
    if (!navigator.geolocation) {
        setStatus("This browser does not support location access. Enter coordinates to search.");
        return;
    }

    locationButton.disabled = true;
    setStatus("Getting your location...");
    navigator.geolocation.getCurrentPosition(
        (position) => {
            latitudeInput.value = position.coords.latitude.toFixed(6);
            longitudeInput.value = position.coords.longitude.toFixed(6);
            locationButton.disabled = false;
            searchCameras();
        },
        (error) => {
            locationButton.disabled = false;
            const message = error.code === error.PERMISSION_DENIED
                ? "Location access was denied. Enter coordinates to search."
                : error.code === error.TIMEOUT
                    ? "Getting your location timed out. Enter coordinates to search."
                    : "Your location could not be determined. Enter coordinates to search.";
            setStatus(message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
}

// [AI-Assisted: Copilot | 2026-11-10]
// Intent: Connect the form and opt-in geolocation button to the local Node API.
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchCameras();
});
locationButton.addEventListener("click", searchAtCurrentLocation);
