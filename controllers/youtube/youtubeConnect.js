import db from "../../database.js";
import { getAuthUrl, getTokens, setCredentials } from "../../api/youtubeAuth.js";

export function initiateYouTubeAuth(req, res) {
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

export async function handleYouTubeCallback(req, res) {
    const { code, state: userId } = req.query;

    try {
        console.log('OAuth callback received:', { code: code?.substring(0, 20) + '...', userId });

        if (!code || !userId) {
            return res.status(400).json({ message: "Missing authorization code or user ID" });
        }

        // Get tokens from Google
        let tokens;
        try {
            tokens = await getTokens(code);
            console.log('Tokens received:', { accessToken: tokens.access_token?.substring(0, 20) + '...' });
        } catch (tokenError) {
            console.error('Failed to get tokens:', tokenError);
            return res.status(400).json({ message: "Failed to exchange authorization code", error: tokenError.message });
        }

        // Fetch YouTube channel details with proper error handling
        let youtube;
        let channelResponse;
        try {
            youtube = setCredentials(tokens);
            console.log('YouTube client created');

            channelResponse = await youtube.channels.list({
                part: 'snippet,statistics',
                mine: true
            });
            console.log('Channel response received:', channelResponse.data);
        } catch (channelError) {
            console.error('Failed to fetch YouTube channel:', channelError);
            return res.status(400).json({ message: "Failed to fetch YouTube channel data", error: channelError.message });
        }

        const channel = channelResponse.data.items?.[0];
        if (!channel) {
            console.error('No channel data found in response');
            return res.status(400).json({ message: "Could not fetch YouTube channel" });
        }

        console.log('Storing channel:', channel.id, channel.snippet.title);

        // Store tokens AND YouTube details in database
        db.query(
            `INSERT INTO youtube_tokens (user_id, access_token, refresh_token, youtube_channel_id, youtube_channel_name, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                 ON DUPLICATE KEY UPDATE
                                      access_token = ?,
                                      refresh_token = ?,
                                      youtube_channel_id = ?,
                                      youtube_channel_name = ?,
                                      updated_at = NOW()`,
            [
                userId,
                tokens.access_token,
                tokens.refresh_token,
                channel.id,
                channel.snippet.title,
                tokens.access_token,
                tokens.refresh_token,
                channel.id,
                channel.snippet.title,
            ],
            (err) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ message: "Failed to store YouTube data", error: err.message });
                }

                console.log('YouTube tokens stored for user:', userId);

                // Log the action
                db.query(
                    'INSERT INTO logs (user_id, action, timestamp) VALUES (?, ?, NOW())',
                    [userId, 'YouTube account linked'],
                    (logErr) => {
                        if (logErr) console.error("Logging error:", logErr);
                    }
                );

                res.redirect('http://localhost:3000/users');
            }
        );

    } catch (error) {
        console.error("YouTube callback error:", error);
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
}


export async function getYouTubeStatus(req, res) {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    db.query(
        'SELECT youtube_channel_id, youtube_channel_name, created_at FROM youtube_tokens WHERE user_id = ?',
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
                connectedAt: results[0].created_at
            });
        }
    );
}