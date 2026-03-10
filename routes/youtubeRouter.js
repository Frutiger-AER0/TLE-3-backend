import express from 'express';
import { getAuthUrl, getTokens, setCredentials } from '../API/youtubeAuth.js';
import db from '../database.js';

const youtubeRouter = express.Router();

// Initiate YouTube OAuth flow
youtubeRouter.get('/auth/youtube', (req, res) => {
    const userId = req.query.userId; // Pass user ID from frontend
    if (!userId) {
        return res.status(400).json({ message: 'User ID required' });
    }

    const authUrl = getAuthUrl();
    // Store userId in URL state parameter to retrieve it in callback
    res.redirect(`${authUrl}&state=${userId}`);
});

// OAuth callback
youtubeRouter.get('/auth/youtube/callback', async (req, res) => {
    const { code, state: userId } = req.query;

    try {
        const tokens = await getTokens(code);

        // Store tokens in database
        db.query(
            'INSERT INTO youtube_tokens (user_id, access_token, refresh_token, created_at) VALUES (?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE access_token = ?, refresh_token = ?',
            [userId, tokens.access_token, tokens.refresh_token, tokens.access_token, tokens.refresh_token],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Failed to store tokens' });
                }
                res.redirect('http://localhost:5173/dashboard?youtube=connected'); // Redirect to your frontend
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Get user's YouTube data
youtubeRouter.get('/youtube/data/:userId', async (req, res) => {
    const { userId } = req.params;

    db.query('SELECT access_token, refresh_token FROM youtube_tokens WHERE user_id = ?', [userId], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: 'YouTube not connected' });
        }

        try {
            const youtube = setCredentials({
                access_token: results[0].access_token,
                refresh_token: results[0].refresh_token
            });

            const response = await youtube.channels.list({
                part: 'snippet,statistics',
                mine: true
            });

            res.json(response.data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to fetch YouTube data' });
        }
    });
});

export default youtubeRouter;