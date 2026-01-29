const https = require('https');
const fs = require('fs');
const path = require('path');

// Load config
const configPath = path.join(__dirname, '../config.json');
if (!fs.existsSync(configPath)) {
    console.error('Error: config.json not found. Please copy config.example.json to config.json and fill in your credentials.');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const { baseUrl, cred, gameId, headers: configHeaders } = config;

if (!baseUrl || !cred) {
    console.error('Error: baseUrl and cred are required in config.json');
    process.exit(1);
}

// Helper function to make HTTP requests
function request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        let url;
        if (endpoint.startsWith('http')) {
            url = new URL(endpoint);
        } else {
            url = new URL(path.join(endpoint).replace(/\\/g, '/'), baseUrl);
        }

        // Append query params for GET requests if needed, though usually params are in path or body
        // Based on analysis, gameId seems to be a query param for some, but let's stick to the specific analysis.
        // For /web/v1/game/endfield/attendance, it seems to be body or query. Analysis said:
        // Gp("/web/v1/game/endfield/attendance", o) where o is {gameId: "3"} likely.

        if (method === 'GET' && data) {
            Object.keys(data).forEach(key => url.searchParams.append(key, data[key]));
        }

        // Helper to update headers with dynamic timestamp
        function getHeaders(baseHeaders) {
            const headers = { ...baseHeaders };
            const ts = Math.floor(Date.now() / 1000).toString();
            headers['timestamp'] = ts;

            // TODO: The 'sign' header likely depends on timestamp and other params.
            // If we update timestamp without updating sign, request might fail if server verifies strict signature.
            // Since we don't have the secret key, we can't generate a valid signature yet.
            // ideally: headers['sign'] = calculateSign(headers, config.secret); 

            // For now, we keep the old sign or maybe the user knows the logic.
            // If the server checks timestamp freshness (e.g. within 5 mins), this update is necessary.
            // If the server checks signature associated with that timestamp, this will break it.

            return headers;
        }

        // ... inside request function ...
        const options = {
            hostname: url.hostname,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'cred': cred,
                'Content-Type': 'application/json',
                'Accept': 'application/json, text/plain, */*',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                ...getHeaders(configHeaders || {})
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    // Handle redirect
                    if (data && data._redirectCount && data._redirectCount > 5) {
                        reject({ statusCode: res.statusCode, body: 'Too many redirects' });
                        return;
                    }
                    console.log(`Redirecting to: ${res.headers.location}`);

                    const nextData = data ? { ...data, _redirectCount: (data._redirectCount || 0) + 1 } : { _redirectCount: 1 };

                    // If location is absolute, use it. If relative, resolve against current URL.
                    let nextUrlString = res.headers.location;
                    if (!nextUrlString.startsWith('http')) {
                        // Resolve relative path
                        // options.protocol is often undefined in https.request options, defaulting to 'https:'
                        const protocol = options.protocol || 'https:';
                        const currentUrl = new URL(options.path, `${protocol}//${options.hostname}`);
                        nextUrlString = new URL(nextUrlString, currentUrl).toString();
                    }

                    resolve(request(method, nextUrlString, nextData));
                    return;
                }

                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch (e) {
                        resolve(body);
                    }
                } else {
                    reject({ statusCode: res.statusCode, body: body, headers: res.headers });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (method === 'POST' && data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function main() {
    try {
        console.log('--- AK Endfield Auto Sign-in ---');

        // Parse gameId to integer
        const gameIdInt = parseInt(gameId || "3", 10);

        // 1. Get Check-In Info
        console.log('Checking status...');
        const info = await request('GET', '/web/v1/game/endfield/attendance', { gameId: gameId || "3" });

        if (info && info.code === 0) {
            const data = info.data || {};
            console.log('Current Status:', data);

            if (data.hasToday) {
                console.log('✅ Already signed in for today.');
            } else {
                console.log('Not signed in yet. Attempting to sign in...');

                // 2. Perform Check-In
                // Fix: Send gameId as integer in body, AND explicitly in query string just in case
                // "Parameter error" often means missing query string or bad type
                // Also some APIs expect "activityId" or similar, but let's stick to gameId first.

                // We will manually append query string for POST to be safe
                const postUrl = `/web/v1/game/endfield/attendance?gameId=${gameId || "3"}`;
                const result = await request('POST', postUrl, { gameId: gameIdInt });

                if (result && result.code === 0) {
                    console.log('✅ Sign in successful!');
                    console.log('Rewards:', result.data);
                } else {
                    console.error('❌ Sign in failed:', result);
                }
            }
        } else {
            console.error('❌ Failed to get attendance info:', info);
        }

    } catch (error) {
        console.error('❌ An error occurred:', error);
    }
}

main();
