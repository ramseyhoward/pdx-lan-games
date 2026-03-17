import type { DbGame, Game } from '../types/game';

export async function getGames(): Promise<DbGame[]> {
  const response = await fetch('/api/games');
  if (!response.ok) throw new Error(`DB read failed: HTTP ${response.status}`);
  return response.json();
}

export async function addGame(game: Game): Promise<'added' | 'duplicate'> {
  const response = await fetch('/api/games', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  if (response.status === 409) return 'duplicate';
  if (!response.ok) throw new Error(`DB write failed: HTTP ${response.status}`);
  return 'added';
}

export async function deleteGame(id: number): Promise<void> {
  const response = await fetch(`/api/games/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error(`DB delete failed: HTTP ${response.status}`);
}

export async function patchGame(
  id: number,
  data: Partial<Game>,
): Promise<void> {
  const response = await fetch(`/api/games/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`DB write failed: HTTP ${response.status}`);
}
