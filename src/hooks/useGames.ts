import { useState, useEffect } from 'react';
import { fetchGameDetails } from '../services/steamApi';
import { getGames, patchGame, addGame, deleteGame } from '../services/gameDb';
import type { Game } from '../types/game';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const dbGames = await getGames();

      const resolved = await Promise.all(
        dbGames.map(async (dbGame) => {
          if (dbGame.title && dbGame.headerUrl) {
            return dbGame as Game;
          }
          const full = await fetchGameDetails(dbGame.appId, dbGame.votes);
          await patchGame(dbGame.id, {
            title: full.title,
            headerUrl: full.headerUrl,
            coverUrl: full.coverUrl,
            steamUrl: full.steamUrl,
            price: full.price,
          });
          return full;
        }),
      );

      setGames(resolved);
    }

    load()
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  async function adjustVotes(id: number, delta: number) {
    setGames((currentGames) => {
      const updated = currentGames.map((g) =>
        g.id === id ? { ...g, votes: g.votes + delta } : g,
      );
      const game = updated.find((g) => g.id === id);
      if (game) patchGame(id, { votes: game.votes });
      return updated;
    });
  }

  async function addNewGame(appId: number): Promise<void> {
    if (games.some((g) => g.appId === appId)) return;
    const game = await fetchGameDetails(appId, 0);
    await addGame(game);
    setGames((prev) => [...prev, game]);
  }

  async function removeGame(id: number): Promise<void> {
    await deleteGame(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  return { games, loading, error, adjustVotes, addNewGame, removeGame };
}
