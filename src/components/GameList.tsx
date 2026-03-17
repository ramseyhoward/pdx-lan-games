import { AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Game as GameType } from '../types/game';
import Game from './Game.tsx';
import './GameList.css';
import { useScreenSize } from '../hooks/useScreenSize.ts';
import Marquee from "react-fast-marquee";
import { useState, useEffect, useRef } from 'react';

interface Props {
  games: GameType[];
  newGameId?: number;
  instantLayout?: boolean;
  ownedGameIds: number[];
  votedGameIds: number[];
  isLoggedIn: boolean;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onRemove: (id: number) => void;
}

export default function GameList({
  games,
  newGameId,
  instantLayout,
  ownedGameIds,
  votedGameIds,
  isLoggedIn,
  onUpvote,
  onDownvote,
  onRemove,
}: Props) {
  let [marqueeMoving, setMarqueeMoving] = useState(true);
  const { width } = useScreenSize();
  const prefersReducedMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (width <= 800) return;

    function onWheel(e: WheelEvent) {
      scrollRef.current?.scrollBy({top: e.deltaY, behavior: 'instant'});
    }
    window.addEventListener('wheel', onWheel, {passive: true});
    return () => window.removeEventListener('wheel', onWheel);
  }, [width]);

  function handleMarqueeMovement() {
    const newMarqueeMovementSetting = !marqueeMoving;
    setMarqueeMoving(newMarqueeMovementSetting);
  }

  return (
    <div className="game-list-wrapper">
      {games.length > 0 && (
        <div className="alert-box">
          <div className="vote-box-small">
            <img className='vote-box-small-image-left'
              src={'/me_pointing_right.png'}
            />
            {width >= 900 ? (
              <Marquee className="vote-box-info-small" speed={30} play={marqueeMoving && !prefersReducedMotion}>
                Log in to vote!
              </Marquee>
            ) : (
              <div className="vote-box-info-small-spans"><span>Hey asshole!</span><span>Don't vote more than once!</span></div>
            )
            }
            <img className='vote-box-small-image-right'
              src={'/me_pointing_left.png'}
            />
          </div>
          {width >= 900 && (
            <div>
              <button className="sort-btn active" onClick={handleMarqueeMovement}>{marqueeMoving ? "Make the marquee stop moving" : "Make the marquee start moving"}</button>
            </div>
          )}
        </div>
      )}
      <div className="game-list-scroll" ref={scrollRef}>
      <ul className="game-list">
        <AnimatePresence>
          {games.map((game) => (
            <Game
              key={game.id}
              initialVotedFlag={votedGameIds.includes(game.id)}
              instantLayout={instantLayout}
              isLoggedIn={isLoggedIn}
              userOwns={ownedGameIds.includes(game.appId)}
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
