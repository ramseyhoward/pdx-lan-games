import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import type { Game as GameType } from '../types/game';
import './Game.css';

const VOTED_KEY = 'pdx-lan-voted';
function getVotedIds(): Set<number> {
  try {
    return new Set(JSON.parse(localStorage.getItem(VOTED_KEY) ?? '[]'));
  } catch { return new Set(); }
}
function persistVote(id: number, voted: boolean) {
  const ids = getVotedIds();
  if (voted) ids.add(id); else ids.delete(id);
  localStorage.setItem(VOTED_KEY, JSON.stringify([...ids]));
}

interface Props {
  game: GameType;
  initialVotedFlag: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onRemove: () => void;
}

export default function Game({ game, initialVotedFlag, onUpvote, onDownvote, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [voted, setVoted] = useState(() => initialVotedFlag || getVotedIds().has(game.id));
  const thumbUpRef = useRef<HTMLImageElement>(null);
  const thumbNeutralRef = useRef<HTMLImageElement>(null);

  function setPressingDirect(pressing: boolean) {
    if (thumbUpRef.current)      thumbUpRef.current.style.display      = pressing ? 'none'  : 'block';
    if (thumbNeutralRef.current) thumbNeutralRef.current.style.display = pressing ? 'block' : 'none';
  }

  function handleVote() {
    if (voted) {
      onDownvote();
      if (game.votes - 1 === 0) {
        setConfirming(true);
      }
    } else {
      onUpvote();
    }
    const newVotedState = !voted;
    setVoted(newVotedState);
    persistVote(game.id, newVotedState);
  }

  function handleConfirm() {
    setConfirming(false);
    persistVote(game.id, false);
    onRemove();
  }

  function handleCancel() {
    setConfirming(false);
    onUpvote();
    setVoted(true);
    persistVote(game.id, true);
  }

  return (
    <motion.li
      className="game-card"
      layout
      transition={{ delay: 1, duration: 0.5 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: 0, duration: .2 } }}
    >
      <img
        className="game-cover"
        src={game.coverUrl}
        alt={game.title}
        onError={(e) => {
          e.currentTarget.src = '/me_shrugging_90x120.jpg';
        }}
      />
      <div className="game-info">
        <h2>{game.title}</h2>
        <p className="game-price">{game.price}</p>
        <a href={game.steamUrl} target="_blank" rel="noreferrer">
          View on Steam
        </a>
      </div>
      <div className="vote-controls">
        <button
          onClick={handleVote}
          onPointerDown={() => setPressingDirect(true)}
          onPointerUp={() => setPressingDirect(false)}
          onPointerLeave={() => setPressingDirect(false)}
          aria-label={voted ? "Remove vote" : "Upvote"}
        >
          <img ref={thumbNeutralRef} className="elle-thumb-neutral" src="/elle_thumb_neutral.png" alt="Neutral" style={{ display: 'none' }} />
          <img ref={thumbUpRef}      className="elle-thumb-up"      src="/elle_thumb_up.png"      alt="Upvote"  style={{ display: 'block' }} />
          <span className={voted ? "vote-count-voted": "vote-count-not-voted"}>{game.votes}</span>
        </button>
      </div>
      {confirming && (
        <div className="remove-confirm">
          <p>Remove {game.title}?</p>
          <div className="remove-confirm-actions">
            <button className="confirm-yes" onClick={handleConfirm}>
              Remove
            </button>
            <button className="confirm-no" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </motion.li>
  );
}
