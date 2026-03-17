import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getGamesCollection, getUsersCollection } from '../_db.js';
import {pusher} from '../_pusher.js';
import { getSession } from '../_auth.js';

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const collection = await getGamesCollection();
    const id = Number(request.query.id);

    if (request.method === 'PATCH') {
        const { action } = request.body as { action: 'upvote' | 'downvote' };
        if (action === 'upvote' || action === 'downvote') {
            const delta = action === 'upvote' ? 1 : -1;

            const session = getSession(request);
            if (session) {
                const users = await getUsersCollection();
                const user = await users.findOne({ steamId: session.steamId });

                if (action === 'upvote' && user?.votedGameIds.includes(id)) {
                    return response.status(409).json({ error: 'Already voted' });
                }
                if (action === 'downvote' && !user?.votedGameIds.includes(id)) {
                    return response.status(409).json({ error: 'No vote to remove' });
                }

                if (action === 'upvote') {
                    await users.updateOne({ steamId: session.steamId }, { $addToSet: { votedGameIds: id } });
                } else {
                    await users.updateOne({ steamId: session.steamId }, { $pull: { votedGameIds: id } });
                }
            }

            const updated = await collection.findOneAndUpdate(
                { id },
                { $inc: { votes: delta } },
                { returnDocument: 'after' },
            );
            const votes = updated?.votes ?? 0;
            await pusher.trigger(`game-${id}`, 'vote-updated', { id, votes });
            return response.status(200).json({ votes });
        }

        await collection.updateOne({ id }, { $set: request.body });
        return response.status(200).end();
    }

    if (request.method === 'DELETE') {
        await collection.deleteOne({ id });
        const users = await getUsersCollection();
        await users.updateMany({}, { $pull: { votedGameIds: id } });
        await pusher.trigger('pdxlan-games', 'game-removed', { id });
        return response.status(200).end();
    }

    response.status(405).end();
}