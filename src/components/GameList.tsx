import { AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Game as GameType } from '../types/game';
import Game from './Game.tsx';
import './GameList.css';
import { useScreenSize } from '../hooks/useScreenSize.ts';
import Marquee from "react-fast-marquee";
import { useState, useEffect, useRef } from 'react';

interface Props {
  games: GameType[];
  instantLayout?: boolean;
  ownedGameIds: number[];
  votedGameIds: number[];
  isLoggedIn: boolean;
  pendingVoteIds: Set<number>;
  gameIdsAwaitingRemoval: Set<number>;
  onUpvote: (id: number) => void;
  onDownvote: (id: number) => void;
  onRemove: (id: number) => void;
  onClearAwaitingRemoval: (id: number) => void;
}

export default function GameList({
  games,
  instantLayout,
  ownedGameIds,
  votedGameIds,
  isLoggedIn,
  pendingVoteIds,
  gameIdsAwaitingRemoval,
  onUpvote,
  onDownvote,
  onRemove,
  onClearAwaitingRemoval,
}: Props) {
  let [marqueeMoving, setMarqueeMoving] = useState(
    () => localStorage.getItem('marqueeMoving') !== 'false'
  );
  const [alertDismissed, setAlertDismissed] = useState(
    () => localStorage.getItem('alertDismissed') === 'true'
  );

  const [overlayGif, setOverlayGif] = useState<string | null>(null);
  const gifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const alertInstantLayoutRef = useRef(false);

  useEffect(() => {
    return () => { if (gifTimeout.current) clearTimeout(gifTimeout.current); };
  }, []);

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
    localStorage.setItem('marqueeMoving', newMarqueeMovementSetting.toString());
    setMarqueeMoving(newMarqueeMovementSetting);
  }

  function handleDismissAlert() {
    alertInstantLayoutRef.current = true;
    requestAnimationFrame(() => { alertInstantLayoutRef.current = false; });
    const newAlertDismissedSetting = !alertDismissed
    const t = Date.now();
    if (newAlertDismissedSetting === true) {
      setOverlayGif(`/i'll-kill-you-tim-robinson.gif?t=${t}`);
      gifTimeout.current = setTimeout(() => setOverlayGif(null), 2000);
    }
    else {
      setOverlayGif(`/frank-come-crawling-back.gif?t=${t}`);
      gifTimeout.current = setTimeout(() => setOverlayGif(null), 6000);
    }
    localStorage.setItem('alertDismissed', newAlertDismissedSetting.toString());
    setAlertDismissed(newAlertDismissedSetting);
  }

  return (
    <div className="game-list-wrapper">
      {overlayGif && (
        <div className="kill-gif-overlay">
          <img src={overlayGif} alt="" />
        </div>
      )}
      {!alertDismissed && (
        <div className="alert-box">
          <div className="vote-box-small">
            <img className='vote-box-small-image-left'
              src={'/me_pointing_right.png'}
            />
            {width >= 900 ? (
              <Marquee className="vote-box-info-small" speed={30} play={marqueeMoving && !prefersReducedMotion}>
                <span style={{ paddingRight: '2rem' }}>Hey nerds! Log in to add games and vote!</span>
              </Marquee>
            ) : (
              <div className="vote-box-info-small-spans"><span>Hey nerds!</span><span>Log in to add games and vote!</span></div>
            )
            }
            <img className='vote-box-small-image-right'
              src={'/me_pointing_left.png'}
            />
          </div>
        </div>
      )}
      <div className="alert-box-buttons">
        <button className="sort-btn active" onClick={handleDismissAlert}>{alertDismissed ? "Add my beautiful faces back" : "Dismiss my beautiful faces"}</button>
        {width >= 900 && !alertDismissed && (
          <button className="sort-btn active" onClick={handleMarqueeMovement}>{marqueeMoving ? "Make the marquee stop moving" : "Make the marquee start moving"}</button>
        )}
      </div>
      <div className="game-list-scroll" ref={scrollRef}>
      <ul className="game-list">
        <AnimatePresence>
          {games.map((game) => (
            <Game
              key={game.id}
              initialVotedFlag={votedGameIds.includes(game.id)}
              instantLayout={instantLayout || alertInstantLayoutRef.current}
              isLoggedIn={isLoggedIn}
              userOwns={ownedGameIds.includes(game.appId)}
              isPending={pendingVoteIds.has(game.id)}
              isAwaitingRemoval={gameIdsAwaitingRemoval.has(game.id)}
              game={game}
              onUpvote={() => onUpvote(game.id)}
              onDownvote={() => onDownvote(game.id)}
              onRemove={() => onRemove(game.id)}
              onClearAwaitingRemoval={() => onClearAwaitingRemoval(game.id)}
            />
          ))}
        </AnimatePresence>
      </ul>
      </div>
    </div>
  );
}
