import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { getUsersCollection } from '../_db';

interface PlayerSummary {
    personaname: string;
    avatarmedium: string;
    communityvisibilitystate: number;
}

interface GetPlayerSummariesResponse {
    response: { players: PlayerSummary[] };
}

interface getOwnedGamesResponse {
    response?: { games?: { appid: number}[] };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const params = request.query as Record<string, string>;

    const valid = await verifyOpenId(params);
    if (!valid) return response.status(401).send('OpenID verticiation failed');

    const claimedId = params['openid.claimed_id'];
    if (!claimedId) return response.status(400).send('Missing claimed_id in OpenId parameters');

    const steamId = claimedId.split('/').pop();
    if (!steamId) return response.status(400).send('Could not extract SteamId from OpenId parameters');

    const userSummaryResult = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`
    );
    const playerSummaryResponse: GetPlayerSummariesResponse = await userSummaryResult.json();
    const player = playerSummaryResponse.response.players[0];
    if (!player) return response.status(502).send('Steam profile not found');

    const gamesOwnedResponse = await fetch(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steamId}`
    );
    const ownedGamesData: getOwnedGamesResponse = await gamesOwnedResponse.json();
    const ownedGameIds = (ownedGamesData.response?.games ?? []).map((g) => g.appid);

    const users = await getUsersCollection();
    await users.updateOne(
        { steamId },
        {
            $set: {
                displayName: player.personaname,
                avatarUrl: player.avatarmedium,
                profileVisible: player.communityvisibilitystate === 3,
                ownedGameIds,
            },
            $setOnInsert: { steamId, votedGameIds: [] },
        },
        { upsert: true }
    );

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) return response.status(500).send('Missing config values');

    const token = jwt.sign({ steamId }, jwtSecret, { expiresIn: '30d' });
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.setHeader('Set-Cookie',
        `session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure}`
    );

    response.redirect(process.env.APP_URL ?? '/');
}

async function verifyOpenId(params: Record<string, string>): Promise<boolean> {
    const checkParams = new URLSearchParams({ ...params, 'openid.mode': 'check_authentication' });

    const verifyResponse = await fetch('https://steamcommunity.com/openid/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: checkParams.toString(),
    });

    const text = await verifyResponse.text();
    return text.includes('is_valid:true');
}