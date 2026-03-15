import type { DbGame, Game } from '../types/game';

export async function getGames(): Promise<DbGame[]> {
  const res = await fetch('/api/games');
  if (!res.ok) throw new Error(`DB read failed: HTTP ${res.status}`);
  return res.json();
}

export async function addGame(game: Game): Promise<void> {
  const res = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  if (!res.ok) throw new Error(`DB write failed: HTTP ${res.status}`);
}

export async function deleteGame(id: number): Promise<void> {
  const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DB delete failed: HTTP ${res.status}`);
}

export async function patchGame(
  id: number,
  data: Partial<Game>,
): Promise<void> {
  const res = await fetch(`/api/games/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`DB write failed: HTTP ${res.status}`);
}
