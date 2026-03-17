import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '../_db.js';
import { parse } from 'cookie';

interface JwtPayload {
    steamId: string;
}

function isJwtPayload(value: unknown): value is JwtPayload {
    return typeof value === 'object' && value !== null && 'steamId' in value;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const cookieHeader = request.headers.cookie;
    if (!cookieHeader) return response.status(401).json({ error: 'Not logged in' });

    const cookies = parse(cookieHeader);
    const token = cookies['session'];
    if (!token) return response.status(401).json({ error: 'Not logged in' });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return response.status(500).json({ error: 'Missing config values'});

    let payload: unknown;
    try {
        payload = jwt.verify(token, jwtSecret);
    } catch {
        return response.status(401).json({ error: 'Session expired/invalid' });
    }

    if (!isJwtPayload(payload)) {
        return response.status(401).json({ error: 'Invalid session' });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ steamId: payload.steamId });
    if (!user) return response.status(401).json({ error: 'User not found' });

    response.json({
        steamId: user.steamId,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        profileVisible: user.profileVisible,
        ownedGameIds: user.ownedGameIds,
        votedGameIds: user.votedGameIds,
    })
}
