import React from 'react';


const Actions = ({ playerName, enemies, action, submitAction }:any) => (
  <div className="actions">
    <button
      onClick={() => submitAction(true)}
      disabled={action !== null}
      className="action-button"
    >
      Colaborar
    </button>
    {enemies.includes(playerName) && (
      <button
        onClick={() => submitAction(false)}
        disabled={action !== null}
        className="action-button"
      >
        Sabotear
      </button>
    )}
  </div>
);

export default Actions;