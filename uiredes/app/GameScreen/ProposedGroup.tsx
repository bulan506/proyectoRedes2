import React from 'react';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";

const ProposedGroup = ({ proposedGroup }:any) => (
  <div className="proposed-group-info">
    <h2>Grupo Propuesto:</h2>
    <ul>
      {proposedGroup.map((player, index) => (
        <li key={index}>{player}</li>
      ))}
    </ul>
  </div>
);

export default ProposedGroup;