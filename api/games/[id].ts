import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from '../_db.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const collection = await getCollection();
    const id = Number(request.query.id);

    if (request.method === 'PATCH') {
        await collection.updateOne({id}, {$set: request.body});
        return response.status(200).end();
    }

    if (request.method === 'DELETE') {
        await collection.deleteOne({id});
        return response.status(200).end();
    }

    response.status(405).end();
}