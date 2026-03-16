import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Game as GameType } from '../types/game';
import './Game.css';

interface Props {
  game: GameType;
  initialVotedFlag: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onRemove: () => void;
}

export default function Game({ game, initialVotedFlag, onUpvote, onDownvote, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [voted, setVoted] = useState(initialVotedFlag ?? false);

  function handleVote() {
    if (voted) {
      onDownvote();
    } else {
      onUpvote();
    }
    setVoted(!voted);
  }

  function handleRemoveClick() {
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    onRemove();
  }

  function handleCancel() {
    setConfirming(false);
  }

  return (
    <motion.li
      className="game-card"
      layout
      transition={{ delay: 1, duration: 0.5 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
          aria-label={voted ? "Remove vote" : "Upvote"}
        >
          <img
            className={voted ? "elle-thumb-neutral" : "elle-thumb-up"}
            src={voted ? '/elle_thumb_neutral.png' : '/elle_thumb_up.png'}
            alt={voted ? 'Remove vote' : 'Upvote'}
          />
          {game.votes}
        </button>
      </div>
      <button
        className="remove-btn"
        onClick={handleRemoveClick}
        aria-label="Remove game"
      >
        ✕
      </button>
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
