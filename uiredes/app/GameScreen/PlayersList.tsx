import React from 'react';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";
const PlayersList = ({ players, selectedGroup, isLeader, isEnemy, setSelectedGroup,isEnemyF }: any) => {

  const selectGroup = (player) => {
    setSelectedGroup((prevGroup) => {
      if (prevGroup.includes(player)) {
        return prevGroup.filter((p) => p !== player); 
      } else {
        return [...prevGroup, player]; 
      }
    });
  };
  return (
    <div className="players-div">
      {players.map((player, index) => (
        <button
          key={index}
          className={`player-button ${selectedGroup.includes(player) ? 'selected' : ''} ${isEnemy && isEnemyF(player) ? 'enemy' : ''}`}
          onClick={() => isLeader && selectGroup(player)}
        >
          <p>{player}</p>
        </button>
      ))}
    </div>
  );
};

export default PlayersList;
