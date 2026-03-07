import type { Game } from '../types/game';

export interface SteamSearchResult {
  id: number;
  name: string;
  tiny_image: string;
}

export async function searchGames(query: string): Promise<SteamSearchResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `/api/steam-search/?term=${encodeURIComponent(query)}&l=english&cc=us`,
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return (json.items ?? []) as SteamSearchResult[];
}

const CDN = 'https://cdn.cloudflare.steamstatic.com/steam/apps';

interface SteamAppData {
  name: string;
  header_image: string;
  is_free: boolean;
  price_overview?: { final_formatted: string };
}

export async function fetchGameDetails(
  appId: number,
  votes: number,
): Promise<Game> {
  const res = await fetch(`/api/steam?appids=${appId}&cc=us`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const data = json[String(appId)]?.data as SteamAppData | undefined;
  if (!data) throw new Error(`No data returned for appId ${appId}`);
  console.log(data);
  return {
    id: appId,
    appId,
    title: data.name,
    headerUrl: data.header_image,
    coverUrl: `${CDN}/${appId}/library_600x900_2x.jpg`,
    steamUrl: `https://store.steampowered.com/app/${appId}`,
    price: data.is_free
      ? 'Free to Play'
      : (data.price_overview?.final_formatted ?? 'N/A'),
    votes,
  };
}
