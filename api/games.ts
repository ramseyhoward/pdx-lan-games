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
        await collection.insertOne(game);
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