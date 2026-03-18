import db from "../database.js";
import { generateApiKey } from "../middleware/apiKey.js";

export function createApiKey(req, res) {
    const userId = req.user.id;
    const { name, expiresInDays } = req.body;

    const newApiKey = generateApiKey();
    let expiresAt = null;

    if (expiresInDays) {
        const date = new Date();
        date.setDate(date.getDate() + expiresInDays);
        expiresAt = date.toISOString().slice(0, 19).replace("T", " ");
    }

    db.query(
        `INSERT INTO api_keys (user_id, api_key, name, expires_at) VALUES (?, ?, ?, ?)`,
        [userId, newApiKey, name || "Default Key", expiresAt],
        (err, result) => {
            if (err) {
                console.error("Error creating API key:", err);
                return res.status(500).json({ error: "Failed to create API key" });
            }

            res.status(201).json({
                message: "API key created successfully",
                api_key: newApiKey,
                name: name || "Default Key",
                expires_at: expiresAt,
                warning: "Save this key somewhere safe. You won't be able to see it again!"
            });
        }
    );
}

export function listApiKeys(req, res) {
    const userId = req.user.id;

    db.query(
        `SELECT id, name, api_key, is_active, last_used, created_at, expires_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC`,
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ error: "Failed to fetch API keys" });
            }

            // Mask the API keys for security
            const maskedKeys = results.map(key => ({
                ...key,
                api_key: key.api_key.substring(0, 8) + "..." // Show only first 8 chars
            }));

            res.json(maskedKeys);
        }
    );
}

export function revokeApiKey(req, res) {
    const userId = req.user.id;
    const { apiKeyId } = req.params;

    db.query(
        `UPDATE api_keys SET is_active = FALSE WHERE id = ? AND user_id = ?`,
        [apiKeyId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to revoke API key" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "API key not found" });
            }

            res.json({ message: "API key revoked successfully" });
        }
    );
}

export function deleteApiKey(req, res) {
    const userId = req.user.id;
    const { apiKeyId } = req.params;

    db.query(
        `DELETE FROM api_keys WHERE id = ? AND user_id = ?`,
        [apiKeyId, userId],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Failed to delete API key" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "API key not found" });
            }

            res.json({ message: "API key deleted successfully" });
        }
    );
}