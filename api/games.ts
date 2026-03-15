import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from './_db.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const collection = await getCollection();

    if (request.method === 'GET') {
        const games = await collection.find({}).toArray();
        return response.json(games);
    }

    if (request.method === 'POST') {
        const game = request.body;
        await collection.insertOne(game);
        return response.status(201).json(game);
    }

    response.status(405).end();
}