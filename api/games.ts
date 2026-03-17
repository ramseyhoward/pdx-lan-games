import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGamesCollection, getUsersCollection } from './_db.js';
import {pusher} from './_pusher.js';
import { getSession } from './_auth.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const collection = await getGamesCollection();

    if (request.method === 'GET') {
        const games = await collection.find({}).toArray();
        return response.json(games);
    }

    if (request.method === 'POST') {
        const game = request.body;
        try {
            await collection.insertOne(game);
        } catch (err: unknown) {
            if ((err as { code?: number }).code === 11000) {
                const existing = await collection.findOne({ appId: game.appId });
                if (!existing) return response.status(500).end();
                return response.status(200).json({ gameId: existing.id });
            }
            throw err;
        }
        const session = getSession(request);
        if (session) {
            const users = await getUsersCollection();
            await users.updateOne({ steamId: session.steamId }, { $addToSet: { votedGameIds: game.id } });
        }
        await pusher.trigger('pdxlan-games', 'game-added', { game });
        return response.status(201).json(game);
    }

    response.status(405).end();
}