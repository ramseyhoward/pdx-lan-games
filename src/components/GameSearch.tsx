import { useState, useEffect, useRef } from 'react';
import { searchGames, type SteamSearchResult } from '../services/steamApi';
import './GameSearch.css';

interface Props {
  existingAppIds: Set<number>;
  onAdd: (appId: number) => Promise<void>;
}

export default function GameSearch({ existingAppIds, onAdd }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SteamSearchResult[]>([]);
  const [adding, setAdding] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const items = await searchGames(query);
        setResults(items);
        setOpen(items.length > 0);
      } catch {
        setResults([]);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleAdd(result: SteamSearchResult) {
    setAdding(result.id);
    try {
      await onAdd(result.id);
      setQuery('');
      setResults([]);
      setOpen(false);
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="game-search" ref={containerRef}>
      <input
        type="search"
        placeholder="Search for a game to add…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
      />
      {open && (
        <ul className="search-results">
          {results.map((result) => {
            const already = existingAppIds.has(result.id);
            return (
              <li key={result.id} className="search-result">
                <img src={result.tiny_image} alt={result.name} />
                <span className="result-name">{result.name}</span>
                <button
                  onClick={() => handleAdd(result)}
                  disabled={already || adding === result.id}
                >
                  {already ? 'Added' : adding === result.id ? '…' : '+ Add'}
                </button>
              </li>
            );
          })}
          <li className="search-result">
            <span className="result-name">Add a non-steam game</span>
          </li>
        </ul>
      )}
    </div>
  );
}
