import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];

export function getAuthUrl() {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });
}

export async function getTokens(code) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        return tokens;
    } catch (error) {
        console.error('Error getting tokens:', error);
        throw error;
    }
}

export function setCredentials(tokens) {
    oauth2Client.setCredentials(tokens);
    return google.youtube({
        version: 'v3',
        auth: oauth2Client,
        headers: {
            'Accept': 'application/json'
        }
    });
}

export default oauth2Client;
