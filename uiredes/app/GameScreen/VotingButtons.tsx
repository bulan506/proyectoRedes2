import React from 'react';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";


const VotingButtons = ({ vote, submitVote }:any) => (
  <div className="voting-buttons">
    <button
      onClick={() => submitVote('true')}
      disabled={vote !== null}
      className={`vote-button ${vote === 'true' ? 'voted' : ''}`}
      aria-label="Votar a favor"
    >
      &#128077;
    </button>
    <button
      onClick={() => submitVote('false')}
      disabled={vote !== null}
      className={`vote-button ${vote === 'false' ? 'voted' : ''}`}
      aria-label="Votar en contra"
    >
      &#128078;
    </button>
  </div>
);

export default VotingButtons;