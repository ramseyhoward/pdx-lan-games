import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getUsersCollection } from './_db.js';

interface GetOwnedGamesResponse {
  response?: { games?: { appid: number }[] };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return response.status(401).end();
  }

  const users = await getUsersCollection();
  const allUsers = await users.find({}).toArray();

  const results = await Promise.allSettled(
    allUsers.map(async (user) => {
      const steamResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${user.steamId}`
      );
      if (!steamResponse.ok) throw new Error(`HTTP ${steamResponse.status} for steamId ${user.steamId}`);
      const ownedGamesData: GetOwnedGamesResponse = await steamResponse.json();
      const ownedGameIds = (ownedGamesData.response?.games ?? []).map((game) => game.appid);
      await users.updateOne({ steamId: user.steamId }, { $set: { ownedGameIds } });
    })
  );

  const failed = results.filter((result) => result.status === 'rejected');
  return response.status(200).json({ updated: results.length - failed.length, failed: failed.length });
}
