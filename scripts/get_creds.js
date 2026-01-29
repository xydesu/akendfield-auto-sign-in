// Copy and paste this code into the Browser Console (F12 -> Console) on the game's website.

// Copy and paste this code into the Browser Console (F12 -> Console) on the game's website.

(function () {
    console.clear();
    console.log("%c=== Auto Sign-in Config Generator ===", "color: lime; font-size: 16px; font-weight: bold;");

    // --- 1. Try LocalStorage Extraction ---
    console.log("%c🔍 Scanning LocalStorage...", "color: yellow");

    function tryGetFromStorage() {
        let foundCred = null;
        let foundRole = null;

        // Search for cred
        // Common keys: "cred", "CRED", "ticket", "token"
        // Also sometimes inside a JSON object
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);

            // Direct match
            if (key.toLowerCase() === "cred" || key === "SK_OAUTH_CRED_KEY") {
                foundCred = val;
            }

            // Special handling for Endfield Role Key
            if (key === "APP_CURRENT_ROLE_GAME_ROLE:endfield") {
                // Format: "4866844507::" -> "3_4866844507_2"
                let raw = val.replace(/::/g, "");
                foundRole = `3_${raw}_2`;
                console.log(`%cFound & Formatted Role: ${foundRole}`, "color: cyan");
            }
            // Check for game role
            else if (key.toLowerCase().includes("role") || key.toLowerCase().includes("sk-game-role")) {
                foundRole = val;
            }

            // If value looks like JSON, check inside
            try {
                const obj = JSON.parse(val);
                if (obj.cred) foundCred = obj.cred;
                if (obj.sk_game_role) foundRole = obj.sk_game_role;
            } catch (e) { }

            // Debug print potential candidates
            if (key.toLowerCase().includes("cred")) {
                console.log(`Possible cred key: [${key}]`, val);
            }
        }

        if (foundCred) {
            console.log("%c✅ Found CRED in LocalStorage!", "color: lime");
            printConfig(foundCred, foundRole);
            return true;
        } else {
            console.log("%c❌ 'cred' not found in LocalStorage root keys.", "color: orange");
            console.log("Trying to find any key with 32-char alphanumeric string...");
            // Fallback: look for any 32-char string that looks like a token
            for (let i = 0; i < localStorage.length; i++) {
                const val = localStorage.getItem(localStorage.key(i));
                if (val && val.length === 32 && /^[a-zA-Z0-9]+$/.test(val)) {
                    console.log(`%cPotential Candidate: ${val}`, "color: cyan");
                }
            }
            return false;
        }
    }

    function printConfig(cred, role) {
        const config = {
            baseUrl: window.location.origin,
            cred: cred,
            gameId: "3",
            headers: {
                "platform": "3",
                "vName": "1.0.0"
            }
        };

        if (role) {
            config.headers["sk-game-role"] = role;
        } else {
            config.headers["sk-game-role"] = "REPLACE_WITH_ROLE_IF_NEEDED";
            console.log("%c⚠️ 'sk-game-role' not found. If the script fails, you might need to find it manually or wait for network capture.", "color: orange");
        }

        console.log("%c⬇️ Generated Config ⬇️", "background: green; color: white");
        console.log(JSON.stringify(config, null, 4));
    }

    // Attempt storage extraction immediately
    const success = tryGetFromStorage();

    // --- 2. Network Interceptor (Fallback) ---
    if (!success) {
        console.log("%c\n📡 LocalStorage scan failed/incomplete. Enabling Network Interceptor...", "color: yellow");
        console.log("Please perform ANY action (switch menus, click buttons) to capture headers.");

        // ... (Keep the network interceptor logic as a backup) ...
        const CAPTURE_HEADERS = ["cred", "sk-language", "sk-game-role"]; // Reduced set since we hardcode others

        function generateConfigFromNet(url, headers) {
            const urlObj = new URL(url);

            const getHeader = (name) => {
                if (headers instanceof Headers) return headers.get(name);
                return Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())
                    ? headers[Object.keys(headers).find(k => k.toLowerCase() === name.toLowerCase())]
                    : null;
            };

            const cred = getHeader("cred");
            if (!cred) return;

            const config = {
                baseUrl: urlObj.origin,
                cred: cred,
                gameId: "3",
                headers: {
                    "platform": "3",
                    "vName": "1.0.0"
                }
            };

            const role = getHeader("sk-game-role");
            if (role) config.headers["sk-game-role"] = role;

            console.log("%c✅ CONFIG CAPTURED (Network)!", "background: green; color: white");
            console.log(JSON.stringify(config, null, 4));
        }

        const originalFetch = window.fetch;
        window.fetch = async function (...args) {
            const [resource, config] = args;
            if (config && config.headers) {
                if (resource.toString().includes("endfield") || resource.toString().includes("attendance") || resource.toString().includes("api")) {
                    try { generateConfigFromNet(resource.toString(), config.headers); } catch (e) { }
                }
            }
            return originalFetch.apply(this, args);
        };

        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this._url = url;
            this._headers = {};
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
            if (this._headers) this._headers[header] = value;
            return originalSetRequestHeader.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function (body) {
            if (this._headers && (this._headers["cred"] || this._headers["Cred"])) {
                try {
                    let fullUrl = this._url;
                    if (fullUrl && fullUrl.startsWith("/")) fullUrl = window.location.origin + fullUrl;
                    generateConfigFromNet(fullUrl || window.location.href, this._headers);
                } catch (e) { }
            }
            return originalSend.apply(this, arguments);
        };
    }

})();
