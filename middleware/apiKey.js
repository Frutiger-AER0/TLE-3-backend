import db from "../database.js";
import crypto from "crypto";

export function generateApiKey() {
    return crypto.randomBytes(32).toString("hex");
}

export function verifyApiKey(req, res, next) {
    // If API key protection is disabled, skip verification
    if (process.env.REQUIRE_API_KEY === "false") {
        console.log("[API KEY] Protection disabled - skipping verification");
        // Still set user from JWT if available (for backward compatibility)
        return next();
    }

    const apiKey = req.headers["x-api-key"] || req.query.api_key;

    if (!apiKey) {
        return res.status(401).json({
            error: "API key required. Use 'X-API-Key' header or ?api_key=YOUR_KEY",
            info: "API key protection is enabled"
        });
    }

    db.query(
        `SELECT * FROM api_keys WHERE api_key = ? AND is_active = TRUE`,
        [apiKey],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ error: "Invalid API key" });
            }

            const apiKeyRecord = results[0];

            // Check if expired
            if (apiKeyRecord.expires_at && new Date(apiKeyRecord.expires_at) < new Date()) {
                return res.status(401).json({ error: "API key expired" });
            }

            // Update last_used
            db.query(
                `UPDATE api_keys SET last_used = NOW() WHERE id = ?`,
                [apiKeyRecord.id]
            );

            // Attach user info to request
            req.user = { id: apiKeyRecord.user_id };
            req.apiKey = apiKeyRecord;
            next();
        }
    );
}