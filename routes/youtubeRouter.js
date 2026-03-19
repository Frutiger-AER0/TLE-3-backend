import express from 'express';
import {
    initiateYouTubeAuth,
    handleYouTubeCallback,
    getYouTubeStatus,
    getYouTubeDetail,
    getLikedVideos,
    postLikedVideos
} from '../controllers/youtube/youtubeConnect.js';
import { verifyToken } from '../middleware/auth.js';

const youtubeRouter = express.Router();

// Test endpoint to verify routing works
youtubeRouter.get('/test-callback', (req, res) => {
    console.log('Test callback reached!');
    res.json({ message: 'Callback endpoint is working' });
});

// Start YouTube OAuth flow (user must be logged in)
youtubeRouter.get('/youtube', verifyToken, initiateYouTubeAuth);

// OAuth callback from Google
youtubeRouter.get('/youtube/callback', (req, res) => {
    console.log('=== YouTube Callback Received ===');
    console.log('Query params:', req.query);
    console.log('Code:', req.query.code?.substring(0, 20) + '...');
    console.log('State:', req.query.state);

    // Call the handler
    handleYouTubeCallback(req, res);
});

// Get YouTube connection status
youtubeRouter.get('/youtube/status', verifyToken, getYouTubeStatus);

// Get detailed YouTube data (channel info + recent videos)
youtubeRouter.get('/youtube/detail', verifyToken, getYouTubeDetail);

// Get liked videos playlist
youtubeRouter.get('/youtube/liked-videos', verifyToken, getLikedVideos);

// POST liked videos to database
youtubeRouter.post('/youtube/liked-videos', verifyToken, postLikedVideos);

export default youtubeRouter;
