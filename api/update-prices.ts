import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCollection } from './_db.js';

const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const collection = await getCollection();
  const games = await collection.find({}).toArray();

  const results = await Promise.allSettled(
    games.map(async (game) => {
      const steamRes = await fetch(
        `https://store.steampowered.com/api/appdetails?appids=${game.appId}&cc=us`
      );
      if (!steamRes.ok) throw new Error(`HTTP ${steamRes.status} for appId ${game.appId}`);
      const json = await steamRes.json();
      const data = json[String(game.appId)]?.data;
      if (!data) throw new Error(`No data for appId ${game.appId}`);

      const discountPercent = data.price_overview?.discount_percent ?? 0;
      await collection.updateOne(
        { id: game.id },
        {
          $set: {
            title: data.name,
            headerUrl: data.header_image,
            coverUrl: `${CDN}/${game.appId}/library_600x900_2x.jpg`,
            steamUrl: `https://store.steampowered.com/app/${game.appId}`,
            finalPrice: data.is_free ? 'Free to Play' : (data.price_overview?.final_formatted ?? 'N/A'),
            initialPrice: data.price_overview?.initial_formatted ?? null,
            onSale: discountPercent > 0,
          },
        },
      );
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected');
  return res.status(200).json({ updated: results.length - failed.length, failed: failed.length });
}
