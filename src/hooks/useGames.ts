import { useState, useEffect } from 'react';
import { fetchGameDetails } from '../services/steamApi';
import { getGames, patchGame, addGame, deleteGame } from '../services/gameDb';
import type { User } from '../types/user';
import type { Game } from '../types/game';
import Pusher from 'pusher-js';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function load() {
      const [dbGames, fetchedUser] = await Promise.all([
        getGames(),
        fetch('/api/auth/me')
          .then(response => response.ok ? response.json() as Promise<User> : null)
          .catch(() => null),
      ]);
      setUser(fetchedUser);

      const games = await Promise.all(
        dbGames.map(async (dbGame) => {
          if (dbGame.title && dbGame.headerUrl) {
            return dbGame as Game; // bad ramsey, fix this
          }
          const fetchedGame = await fetchGameDetails(dbGame.appId, dbGame.votes);
          console.log(fetchedGame);
          await patchGame(dbGame.id, {
            title: fetchedGame.title,
            headerUrl: fetchedGame.headerUrl,
            coverUrl: fetchedGame.coverUrl,
            steamUrl: fetchedGame.steamUrl,
            finalPrice: fetchedGame.finalPrice,
            initialPrice: fetchedGame.initialPrice || undefined,
            onSale: fetchedGame.onSale,
          });
          return fetchedGame;
        }),
      );

      setGames(games);
    }

    load()
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe('pdxlan-games');
    channel.bind('changed', () => {
      load().catch((e: unknown) => setError(String(e)));
    })

    return () => {
      channel.unbind_all();
      pusher.disconnect();
    }
  }, [refreshKey]);

  function refresh() {
    setRefreshKey(key => key + 1);
  }

  async function adjustVotes(id: number, delta: number): Promise<number> {
    const action = delta > 0 ? 'upvote' : 'downvote';
    setGames((currentGames) => currentGames.map((game) => game.id === id ? { ...game, votes: game.votes + delta } : game));
    const response = await fetch(`api/games/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
    const { votes } = await response.json() as { votes: number };
    setGames((currentGames) => currentGames.map((game) => game.id === id ? { ...game, votes } : game));
    return votes;
  }

  async function addNewGame(appId: number): Promise<number | undefined> {
    if (games.some((g) => g.appId === appId)) return;
    const game = await fetchGameDetails(appId, 1);
    await addGame(game);
    setGames((prev) => [...prev, game]);
    setUser((prev) => prev ? { ...prev, votedGameIds: [...prev.votedGameIds, game.id] } : prev);
    return game.id;
  }

  async function removeGame(id: number): Promise<void> {
    await deleteGame(id);
    setGames((prev) => prev.filter((g) => g.id !== id));
  }

  return { games, loading, error, user, adjustVotes, addNewGame, removeGame, refresh };
}
