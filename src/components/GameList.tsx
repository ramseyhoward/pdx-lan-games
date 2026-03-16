import { AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Game as GameType } from '../types/game';
import Game from './Game.tsx';
import './GameList.css';
import { useScreenSize } from '../hooks/useScreenSize.ts';
import Marquee from "react-fast-marquee";

interface Props {
  games: GameType[];
  newGameId?: number;
  instantLayout?: boolean;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function GameList({
  games,
  newGameId,
  instantLayout,
  onUpvote,
  onDownvote,
  onRemove,
}: Props) {
  const { width } = useScreenSize();
  const prefersReducedMotion = useReducedMotion();
  return (
    <div className="game-list-wrapper">
      {games.length > 0 && (
        <div className="vote-box-small">
          <img className='vote-box-small-image-left'
            src={'/me_pointing_right.png'}
          />
          {width >= 900 ? (
            <Marquee className="vote-box-info-small" play={!prefersReducedMotion}>
            Hey asshole! Don't vote more than once!
          </Marquee>
          ) : (
            <div className="vote-box-info-small-spans"><span>Hey asshole!</span><span>Don't vote more than once!</span></div>
          )
          }
          <img className='vote-box-small-image-right'
            src={'/me_pointing_left.png'}
          />
        </div>
      )}
      <div className="game-list-scroll">
      <ul className="game-list">
        <AnimatePresence>
          {games.map((game) => (
            <Game
              key={game.id}
              initialVotedFlag={game.id === newGameId}
              instantLayout={instantLayout}
              game={game}
              onUpvote={() => onUpvote(game.id)}
              onDownvote={() => onDownvote(game.id)}
              onRemove={() => onRemove(game.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
      </div>
    </div>
  );
}
