import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Game as GameType } from '../types/game';
import './Game.css';

interface Props {
  game: GameType;
  initialVotedFlag: boolean;
  instantLayout?: boolean;
  isLoggedIn: boolean;
  userOwns: boolean;
  onUpvote: () => void;
  onDownvote: () => void;
  onRemove: () => void;
}

export default function Game({ game, initialVotedFlag, instantLayout, isLoggedIn, userOwns, onUpvote, onDownvote, onRemove }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [voted, setVoted] = useState(initialVotedFlag);

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
  }

  function handleConfirm() {
    setConfirming(false);
    onRemove();
  }

  function handleCancel() {
    setConfirming(false);
    onUpvote();
    setVoted(true);
  }

  const displayPrice = game.onSale && game.initialPrice ? <><s className="sale-initial-price">{game.initialPrice}</s> {game.finalPrice}</>
  : game.finalPrice

  const tobiasFireSaleLink = 'https://youtu.be/280yPTyei0U?si=6CXOA9vA0AUgkZ7R';

  return (
    <motion.li
      className={`game-card${userOwns ? ' owned' : ''}`}
      layout
      transition={{ delay: instantLayout ? 0 : 1, duration: 0.5 }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { delay: 0, duration: .2 } }}
    >
      {userOwns && <div className="owns-badge">Owned</div>}
      <a href={game.steamUrl} target="_blank" rel="noreferrer">
        <img
          className="game-cover"
          src={game.coverUrl}
          alt={game.title}
          onError={(e) => {
            e.currentTarget.src = '/me_shrugging_90x120.jpg';
          }}
        />
      </a>
      <div className="game-info">
        <h2 className="game-title">{game.title}</h2>
        <p className="game-price">{displayPrice}</p>
        {game.onSale && (
          <a href={tobiasFireSaleLink} target="_blank" rel="noreferrer" className="sale-link">
            It's on sale!
          </a>
        )}
        <a href={game.steamUrl} target="_blank" rel="noreferrer">
          View on Steam
        </a>
      </div>
      <div className="vote-controls">
        <button
          disabled={!isLoggedIn}
          className={voted ? "voted" : undefined}
          onClick={handleVote}
          aria-label={voted ? "Remove vote" : "Upvote"}
        >
          <img
            className="elle-thumb-up"
            src={voted ? '/elle_thumb_up.png' : '/elle_thumb_neutral.png'}
            alt={voted ? 'Voted' : 'Vote'}
          />
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
