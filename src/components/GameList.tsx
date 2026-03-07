import { Fragment } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Game as GameType } from '../types/game';
import Game from './Game.tsx';
import './GameList.css';
import { useScreenSize } from '../hooks/useScreenSize.ts';

interface Props {
  games: GameType[];
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function GameList({
  games,
  onUpvote,
  onDownvote,
  onRemove,
}: Props) {
  const { width } = useScreenSize();
  const largeScreenArrowPosition = "M 1,8 L 15,8 M 4,11 L 1,8 L 4,5";
  const smallScreenArrowPosition = "M 15,8 L 1,8 M 12,11 L 15,8 L 12,5";
  return (
    <div className="game-list-wrapper">
      <div className="game-list-scroll">
      <ul className="game-list">
        <AnimatePresence>
          {games.map((game) => (
            <Game
              key={game.id}
              game={game}
              onUpvote={() => onUpvote(game.id)}
              onDownvote={() => onDownvote(game.id)}
              onRemove={() => onRemove(game.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
      </div>
      {games.length > 0 && (
        <div className={width >= 1400 ? "vote-box-large" : "vote-box-small"}>
          <svg className="vote-box-arrow" viewBox="0 0 16 16" fill="none">
            <path
              d={width >= 1400 ? largeScreenArrowPosition : smallScreenArrowPosition}
              stroke="white"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="vote-box-info">
            <span>Hey asshole!</span>
            <span>Don't vote more than once!</span>
          </div>
        </div>
      )}
    </div>
  );
}
