import db from "../../database.js";
import { getAuthUrl, getTokens, setCredentials } from "../../api/youtubeAuth.js";

export default function initiateYouTubeAuth(req, res) {
    try {
        const userId = req.user?.id; // Pass user ID from the JSon Web Token Middleware
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

    const authUrl = getAuthUrl();
    // Store userId in URL to retrieve it in the callback
        res.json({
            authUrl: `${authUrl}&state=${userId}`,
            message: "Please visit this URL to authorize YouTube access"
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to initiate YouTube auth", error: error.message });
    }
}

export async function handleYoutubeCallback(req, res) {
    const { code, state: userId } = req.query;

    try {
        if (!code || !userId) {
            return res.status(400).json({ message: "Missing authorization code or user ID" });
        }

        // Get tokens from Google
        const tokens = await getTokens(code);

        // Fetch YouTube channel details
        const youtube = setCredentials(tokens);
        const channelResponse = await youtube.channels.list({
            part: 'snippet,statistics',
            mine: true
        });

        const channel = channelResponse.data.items[0];
        if (!channel) {
            return res.status(400).json({ message: "Could not fetch YouTube channel" });
        }

        // Store tokens AND YouTube details in database
        db.query(
            `INSERT INTO youtube_tokens (user_id, access_token, refresh_token, youtube_channel_id, youtube_channel_name, youtube_channel_pic, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW()) 
             ON DUPLICATE KEY UPDATE 
             access_token = ?, 
             refresh_token = ?, 
             youtube_channel_id = ?, 
             youtube_channel_name = ?, 
             youtube_channel_pic = ?, 
             updated_at = NOW()`,
            [
                userId,
                tokens.access_token,
                tokens.refresh_token,
                channel.id,
                channel.snippet.title,
                channel.snippet.thumbnails.default.url,
                tokens.access_token,
                tokens.refresh_token,
                channel.id,
                channel.snippet.title,
                channel.snippet.thumbnails.default.url
            ],
            (err) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Failed to store YouTube data" });
                }

                // Log the action
                db.query(
                    'INSERT INTO logs (user_id, action, timestamp) VALUES (?, ?, NOW())',
                    [userId, 'YouTube account linked'],
                    (logErr) => {
                        if (logErr) console.error("Logging error:", logErr);
                    }
                );

                res.redirect('http://localhost:5173/dashboard?youtube=connected&channel=' + channel.snippet.title);
            }
        );

    } catch (error) {
        console.error("YouTube callback error:", error);
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
}

export async function getYoutubeStatus(req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    db.query(
        'SELECT youtube_channel_id, youtube_channel_name, youtube_channel_pic, created_at FROM youtube_tokens WHERE user_id = ?',
        [userId],
        (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }

            if (results.length === 0) {
                return res.status(404).json({ connected: false, message: "YouTube not connected" });
            }

            res.json({
                connected: true,
                channelId: results[0].youtube_channel_id,
                channelName: results[0].youtube_channel_name,
                channelPic: results[0].youtube_channel_pic,
                connectedAt: results[0].created_at
            });
        }
    );
}