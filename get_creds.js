// Copy and paste this code into the Browser Console (F12 -> Console) on the game's website.

(function () {
    console.clear();
    console.log("%c=== Auto Sign-in Credential Helper ===", "color: lime; font-size: 16px; font-weight: bold;");

    // 1. Check LocalStorage
    console.group("📂 LocalStorage Candidates");
    let foundInStorage = false;
    try {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            if (key.toLowerCase().includes("cred") || key.toLowerCase().includes("token") || key.toLowerCase().includes("auth")) {
                console.log(`%cFound potential key: ${key}`, "color: cyan", val);
                foundInStorage = true;
            }
        }
    } catch (e) { console.error("Could not read LocalStorage", e); }
    if (!foundInStorage) console.log("No obvious credentials found in LocalStorage.");
    console.groupEnd();

    // 2. Network Interceptor (The most reliable way)
    console.log("%c\n📡 Setting up Network Interceptor...", "color: yellow");
    console.log("Please perform an action on the page (e.g., refresh or click 'Check In') to capture headers.");

    // Intercept Fetch
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const [resource, config] = args;
        if (config && config.headers) {
            checkForCreds("FETCH", resource, config.headers);
        }
        return originalFetch.apply(this, args);
    };

    // Intercept XHR
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._url = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        if (this._url && (this._url.includes("endfield") || this._url.includes("attendance"))) {
            // Accessing headers in XHR is tricky as they are internal until sent.
            // We can monkey-patch setRequestHeader.
        }
        return originalSend.apply(this, arguments);
    };

    const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        if (header.toLowerCase() === "cred" || header.toLowerCase() === "authorization") {
            console.log(`%c[XHR] Captured ${header}:`, "color: lime; font-weight: bold;", value);
            console.log(`%cURL:`, "color: gray", this._url);
        }
        return originalSetRequestHeader.apply(this, arguments);
    };

    function checkForCreds(type, url, headers) {
        // Handle Headers object or plain object
        let cred = null;
        if (headers instanceof Headers) {
            cred = headers.get("cred") || headers.get("Cred");
        } else {
            cred = headers["cred"] || headers["Cred"];
        }

        if (cred) {
            console.log(`%c[${type}] CAPTURED CREDENTIAL!`, "background: red; color: white; font-size: 14px; padding: 4px;");
            console.log(`%cURL:`, "color: gray", url);
            console.log(`%ccred:`, "color: lime; font-weight: bold;", cred);
            console.log("-----------------------------------");
        }
    }

    console.log("✅ Interceptor active. Waiting for requests...");
})();
