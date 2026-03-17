import { useState, useRef } from 'react';
import { useGames } from '../hooks/useGames';
import GameList from './GameList.tsx';
import GameSearch from './GameSearch.tsx';
import './HomePage.css'

type SortKey = 'votes' | 'price';
const sortKeys: SortKey[] = ['votes', 'price'];

type SortDirection = 'desc' | 'asc';
const sortDirections: SortDirection[] = ['desc', 'asc'];


function parsePrice(price: string): number {
  if (price.toLowerCase().includes('free')) return 0;
  const n = parseFloat(price.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? -1 : n;
}

export default function HomePage() {
  const { games, loading, error, user, pendingVoteIds, gameIdsAwaitingRemoval, adjustVotes, addNewGame, removeGame, clearGameAwaitingRemoval } =
    useGames();
  const [sortKey, setSortKey] = useState<SortKey>('votes');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const instantLayoutRef = useRef(false);

  function handleSortKey(key: SortKey) {
    instantLayoutRef.current = true;
    setSortKey(key);
    requestAnimationFrame(() => { instantLayoutRef.current = false; });
  }

  function handleSortDirection(dir: SortDirection) {
    instantLayoutRef.current = true;
    setSortDir(dir);
    requestAnimationFrame(() => { instantLayoutRef.current = false; });
  }

  const sortMultiplier = sortDir === 'desc' ? 1 : -1;
  const sorted = games.slice().sort((a, b) => {
    if (sortKey === 'votes') return sortMultiplier * (b.votes - a.votes);
    else return sortMultiplier * (parsePrice(b.finalPrice) - parsePrice(a.finalPrice));
  });

  const existingAppIds = new Set(games.map((g) => g.appId));

  async function handleAddGame(appId: number) {
    await addNewGame(appId);
  }

  return (
    <div className="home-page">
      <h1>PDX LAN GAMES</h1>
      {user ? (
        <div className="user-info">
          <img src={user.avatarUrl} alt={user.displayName} className="user-avatar" />
          <span>{user.displayName}</span>
          <a href="/api/auth/logout">Log out</a>
        </div>
      ) : (
        <a className="steam-sign-in" href="#" onClick={async (e) => { e.preventDefault(); const { url } = await fetch('/api/auth/steam').then(r => r.json()); window.location.href = url; }}>
          <img src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png" alt="Sign in with Steam" />
        </a>
      )}
      {user && <GameSearch existingAppIds={existingAppIds} onAdd={handleAddGame} />}
      <div className="sort-controls">
        <span className="sort-label">Sort by:</span>
        <div className="sort-keys">
          {sortKeys.map((key) => (
            <button
              key={key}
              className={`sort-btn${sortKey === key ? ' active' : ''}`}
              onClick={() => handleSortKey(key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
          ))}
        </div>
        <div className="sort-dirs">
          {sortDirections.map((d) => (
            <button
              key={d}
              className={`sort-btn${sortDir === d ? ' active' : ''}`}
              onClick={() => handleSortDirection(d)}
            >
              {d === 'desc' ? '↓ Desc' : '↑ Asc'}
            </button>
          ))}
        </div>
      </div>
      {loading && <p className="status">Loading games…</p>}
      {error && <p className="status error">Failed to load games: {error}</p>}
      {!loading && !error && (
        <GameList
          games={sorted}
          instantLayout={instantLayoutRef.current}
          ownedGameIds={user?.ownedGameIds ?? []}
          votedGameIds={user?.votedGameIds ?? []}
          isLoggedIn={!!user}
          pendingVoteIds={pendingVoteIds}
          gameIdsAwaitingRemoval={gameIdsAwaitingRemoval}
          onUpvote={(id) => adjustVotes(id, 1)}
          onDownvote={(id) => adjustVotes(id, -1)}
          onRemove={removeGame}
          onClearAwaitingRemoval={clearGameAwaitingRemoval}
        />
      )}
    </div>
  );
}
