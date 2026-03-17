import { useState, useEffect } from 'react';
import { fetchGameDetails } from '../services/steamApi';
import { getGames, patchGame, addGame, deleteGame } from '../services/gameDb';
import type { User } from '../types/user';
import type { Game } from '../types/game';
import Pusher from 'pusher-js';
import { usePusherQueue } from './usePusherQueue';

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { pendingKeys: pendingVoteIds, enqueue: enqueueVote, dequeue: dequeueVote } = usePusherQueue<number>();
  const { enqueue: enqueueAdd, dequeue: dequeueAdd } = usePusherQueue<number>();

  useEffect(() => {
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    });

    function subscribeToGame(id: number) {
      if (pusher.channel(`game-${id}`)) return;
      const gameChannel = pusher.subscribe(`game-${id}`);
      gameChannel.bind('vote-updated', ({ id, votes }: { id: number; votes: number }) => {
        setGames((current) => current.map((game) => game.id === id ? { ...game, votes } : game));
        dequeueVote(id);
      });
    }

    const globalChannel = pusher.subscribe('pdxlan-games');
    globalChannel.bind('game-added', ({ game }: { game: Game }) => {
      subscribeToGame(game.id);
      setGames((current) => {
        if (current.some((existing) => existing.id === game.id)) return current;
        return [...current, game];
      });
      dequeueAdd(game.id);
    });
    globalChannel.bind('game-removed', ({ id }: { id: number }) => {
      setGames((current) => current.filter((game) => game.id !== id));
      pusher.unsubscribe(`game-${id}`);
    });

    async function load() {
      const [dbGames, fetchedUser] = await Promise.all([
        getGames(),
        fetch('/api/auth/me')
          .then(response => response.ok ? response.json() as Promise<User> : null)
          .catch(() => null),
      ]);
      setUser(fetchedUser);

      const loadedGames = await Promise.all(
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

      for (const game of loadedGames) subscribeToGame(game.id);
      setGames(loadedGames);
    }

    load()
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));

    return () => {
      globalChannel.unbind_all();
      pusher.disconnect();
    };
  }, []);

  async function adjustVotes(id: number, delta: number): Promise<void> {
    const action = delta > 0 ? 'upvote' : 'downvote';
    setGames((current) => current.map((game) => game.id === id ? { ...game, votes: game.votes + delta } : game));
    enqueueVote(id);
    await fetch(`api/games/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    });
  }

  async function addNewGame(appId: number): Promise<void> {
    if (games.some((game) => game.appId === appId)) return;
    const game = await fetchGameDetails(appId, 1);
    const pusherConfirmed = enqueueAdd(game.id);
    await addGame(game);
    setUser((current) => current ? { ...current, votedGameIds: [...current.votedGameIds, game.id] } : current);
    await pusherConfirmed;
  }

  async function removeGame(id: number): Promise<void> {
    await deleteGame(id);
  }

  return { games, loading, error, user, pendingVoteIds, adjustVotes, addNewGame, removeGame };
}
