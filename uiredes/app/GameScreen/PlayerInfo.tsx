import React from 'react';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";

const PlayerInfo = ({ playerName, isEnemy, isLeader }:any) => (
  <div className="player-info">
    <p className='label'>{playerName}</p>
    {isEnemy && <p className="enemy-marker">Eres un enemigo</p>}
    {isLeader && <p className="leader-marker">Eres el lider</p>}
  </div>
);

export default PlayerInfo;