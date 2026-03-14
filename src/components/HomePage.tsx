import { useState } from 'react';
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
  const { games, loading, error, adjustVotes, addNewGame, removeGame } =
    useGames();
  const [sortKey, setSortKey] = useState<SortKey>('votes');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');

  const sortMultiplier = sortDir === 'desc' ? 1 : -1;
  const sorted = games.slice().sort((a, b) => {
    if (sortKey === 'votes') return sortMultiplier * (b.votes - a.votes);
    else return sortMultiplier * (parsePrice(b.price) - parsePrice(a.price));
  });

  const existingAppIds = new Set(games.map((g) => g.appId));

  return (
    <div className="home-page">
      <h1>CHAD SUCKS SO HARD</h1>
      <GameSearch existingAppIds={existingAppIds} onAdd={addNewGame} />
      <div className="sort-controls">
        <span className="sort-label">Sort by:</span>
        <div className="sort-keys">
          {sortKeys.map((key) => (
            <button
              key={key}
              className={`sort-btn${sortKey === key ? ' active' : ''}`}
              onClick={() => setSortKey(key)}
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
              onClick={() => setSortDir(d)}
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
          onUpvote={(id) => adjustVotes(id, 1)}
          onDownvote={(id) => adjustVotes(id, -1)}
          onRemove={removeGame}
        />
      )}
    </div>
  );
}
