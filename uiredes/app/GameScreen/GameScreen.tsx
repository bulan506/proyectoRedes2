import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";
import ModalComponent from '@/app/components/ModalComponet';
const SERVER = process.env.NEXT_PUBLIC_SERVER;

const GameScreen = ({ game, password, playerName }: any) => {
  const [error, setError] = useState('');
  const [players, setPlayers] = useState(game.players || []);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [gameStatus, setGameStatus] = useState(game.status || 'lobby');
  const [currentRound, setCurrentRound] = useState('');
  const [enemies, setEnemies] = useState([]);
  const [leader, setLeader] = useState('');
  const [proposedGroup, setProposedGroup] = useState([]);
  const [vote, setVote] = useState(null);
  const [roundStatus, setRoundStatus] = useState('');
  const [allVoted, setAllVoted] = useState(false); // Nuevo estado
  const [action, setAction] = useState(null);

  const fetchGameState = async () => {
    const headers: any = {
      'player': playerName,
    };
    if (game.password) {
      headers.password = password;
    }
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        setPlayers(data.data.players);
        setGameStatus(data.data.status);
        setCurrentRound(data.data.currentRound);
        setEnemies(data.data.enemies);
        if (gameStatus === 'ended') { }
      } else {
        showModalWithMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error en la solicitud GET: ${error.message}`);
    }
  };

  const countWinner = async () => {
    const headers: any = {
      'player': playerName,
    };
    if (game.password) {
      headers.password = password;
    }
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/rounds/`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        const rounds = data.data; 
        let citizenWins = 0;
        let enemyWins = 0;
        rounds.forEach((round: any) => {
          if (round.status === "ended") {
            if (round.result === "citizens") {
              citizenWins++;
            } else if (round.result === "enemies") {
              enemyWins++;
            }
          }
        });
        if (citizenWins >= 3) {
          showModalWithMessage("¡Los ciudadanos ganaron el juego!");
        } else if (enemyWins >= 3) {
          showModalWithMessage("¡Los enemigos ganaron el juego!");
        }
      } else {
        showModalWithMessage(`Error al obtener las rondas: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error en la solicitud GET de ronda: ${error.message}`);
    }
  };


  const fetchRoundInfo = async () => {
    const headers: any = {
      'player': playerName,
    };
    if (game.password) {
      headers.password = password;
    }
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/rounds/${currentRound}`, {
        method: 'GET',
        headers,
      });
      const data = await response.json();
      if (response.ok) {
        if(data.data.status === 'voting' && data.data.votes.length === 0){
          setVote(null);
          setAllVoted(false)
        }
        setLeader(data.data.leader);
        setProposedGroup(data.data.group);
        setRoundStatus(data.data.status);
        checkAllPlayersVoted(data.data.votes);
        if (data.data.status === 'ended') { 
          fetchGameState();
          if(data.data.result === 'citizens'){
            showModalWithMessage('¡Los ciudadanos ganaron la ronda!');
          }else if(data.data.result === 'enemies'){
            showModalWithMessage('¡Los enemigos ganaron la ronda!');
          }
        }
        if(data.data.status === 'waiting-on-leader'){setAction(null);}
      } else {
        showModalWithMessage(`Error al obtener la ronda: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error en la solicitud GET de ronda: ${error.message}`);
    }
  };

  const checkAllPlayersVoted = (votes) => {
    const hasAllVoted = players.length === votes.length;
    setAllVoted(hasAllVoted);
  };

  const selectGroup = (player) => {
    setSelectedGroup((prevGroup) => {
      if (prevGroup.includes(player)) {
        return prevGroup.filter((p) => p !== player); // Deseleccionar
      } else {
        return [...prevGroup, player]; // Seleccionar
      }
    });
  };

  const submitGroup = async () => {
    if (selectedGroup.length === 0) {
      showModalWithMessage('No puedes enviar un grupo vacío.');
      return;
    }

    const headers: any = {
      'player': playerName,
      'Content-Type': 'application/json',
    };
    if (game.password) {
      headers.password = password;
    }

    const body = JSON.stringify({ group: selectedGroup });

    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/rounds/${currentRound}`, {
        method: 'PATCH',
        headers,
        body,
      });

      const errorMsg = response.headers.get('X-msg');
      const dataError = await response.json();
      if (response.ok) {
        showModalWithMessage('Grupo enviado exitosamente.');
        await fetchRoundInfo();
      } else {
        const statusMessages: any = {
          401: `Credenciales inválidas: ${errorMsg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: solo el líder puede enviar el grupo',
          404: `Ronda no encontrada: ${errorMsg || 'Sin mensaje'}`,
          428: `Grupo no permitido: ${dataError.msg || 'Sin mensaje'}`,
        };
        showModalWithMessage(statusMessages[response.status] || `Error desconocido: ${response.status}`);
      }
    } catch (error) {
      setError(`Error al enviar el grupo: ${error.message}`);
      console.error('Error al enviar el grupo:', error);
    }
  };

  const submitVote = async (voteValue) => {
    const headers: any = {
      'player': playerName,
      'Content-Type': 'application/json',
    };
    if (game.password) {
      headers.password = password;
    }
    const body = JSON.stringify({ vote: voteValue });
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/rounds/${currentRound}`, {
        method: 'POST',
        headers,
        body,
      });

      const errorMsg = response.headers.get('X-msg');
      if (response.ok) {
        setVote(voteValue);
      } else {
        const statusMessages: any = {
          401: `No autorizado: ${errorMsg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: usted no es parte del juego',
          404: `Juego no encontrado: ${errorMsg || 'Sin mensaje'}`,
          409: `Usted ya ha votado: ${errorMsg || 'Sin mensaje'}`,
          428: `No se puede realizar esta acción en este momento: ${errorMsg || 'Sin mensaje'}`,
        };
        showModalWithMessage(statusMessages[response.status] || `Error desconocido: ${response.status}`);
      }
    } catch (error) {
      setError(`Error al enviar el voto: ${error.message}`);
      console.error('Error al enviar el voto:', error);
    }
  };

  const submitAction = async (actionValue) => {
    const headers: any = {
      'player': playerName,
      'Content-Type': 'application/json',
    };
    if (game.password) {
      headers.password = password;
    }
    const body = JSON.stringify({ action: actionValue });
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/rounds/${currentRound}`, {
        method: 'PUT',
        headers,
        body,
      });

      const errorMsg = response.headers.get('X-msg');
      if (response.ok) {
        setAction(actionValue);
        fetchRoundInfo(); // Refrescar la información de la ronda
      } else {
        const statusMessages: any = {
          401: `No autorizado: ${errorMsg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: no eres parte del juego',
          404: `Recurso no encontrado: ${errorMsg || 'Sin mensaje'}`,
          409: `Conflicto: ${errorMsg || 'Sin mensaje'}`,
          428: `Acción no permitida: ${errorMsg || 'Sin mensaje'}`,
        };
        showModalWithMessage(statusMessages[response.status] || `Error desconocido: ${response.status}`);
      }
    } catch (error) {
      setError(`Error al enviar la acción: ${error.message}`);
      console.error('Error al enviar la acción:', error);
    }
  };

  useEffect(() => {
    if (gameStatus !== 'ended') {
      const intervalId = setInterval(fetchGameState, 3000);
      return () => clearInterval(intervalId);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'rounds') {
      const intervalId = setInterval(fetchRoundInfo, 3000);
      return () => clearInterval(intervalId);
    }
  }, [gameStatus, currentRound]);

  useEffect(() => {
    if (gameStatus === 'ended') {
      countWinner();
    }
  }, [gameStatus]);


  const isOwner = () => playerName.toLowerCase() === game.owner.toLowerCase();
  const isEnemy = (player) => enemies.includes(player);
  const imLeader = () => playerName === leader;
  const imPartOfGroup = (player) => proposedGroup.includes(player);


  const startGame = async () => {
    const data = {
      player: game.owner,
    };
    if (game.password) {
      data.password = password;
    }
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/start`, {
        method: 'HEAD',
        headers: data,
      });
      const errorMsg = response.headers.get('X-msg');
      if (response.status === 200) {
        showModalWithMessage('El juego ha comenzado exitosamente.');
        fetchGameState();
      } else {
        const statusMessages: any = {
          401: `No autorizado: ${errorMsg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: usted no es un owner',
          404: `Juego no encontrado: ${errorMsg || 'Sin mensaje'}`,
          409: `El juego ya ha comenzado: ${errorMsg || 'Sin mensaje'}`,
          428: `Se necesitan 5 jugadores para comenzar: ${errorMsg || 'Sin mensaje'}`,
        };
        showModalWithMessage(statusMessages[response.status] || `Error desconocido: ${response.status}`);
      }
    } catch (error) {
      setError(`Error al iniciar el juego: ${error.message}`);
      console.error('Error al iniciar el juego:', error);
    }
  };

  const showModalWithMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h1>Nombre del Juego: {game.name}</h1>
      {leader && (<h1>El lider es: {leader}</h1>)}
      {roundStatus && (<h1>El estado de la partida es: {roundStatus}</h1>)}


      <>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="game-interface">
          <div className="player-info">
            <p>{playerName}</p>
            {isEnemy(playerName) && <p className="enemy-marker"> Eres un enemigo </p>}
            {imLeader() && <p className="leader-marker"> Eres el líder </p>}
          </div>
          <div className="players-div">
            {players.map((player, index) => (
              <button
                key={index}
                className={`player-button 
                  ${selectedGroup.includes(player) ? 'selected' : ''}
                  ${isEnemy(playerName) && isEnemy(player) ? 'enemy' : ''}
                `}
                onClick={() => imLeader() && selectGroup(player)}
              >
                <p>{player}</p>
              </button>
            ))}
          </div>
          {imLeader() && roundStatus === 'waiting-on-leader' && (
            <>
              <div className="selected-group-info">
                <h2>Grupo Seleccionado:</h2>
                <ul>
                  {selectedGroup.map((player, index) => (
                    <li key={index}>{player}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
          {proposedGroup.length > 0 && roundStatus === 'voting' && (
            <div className="proposed-group-info">
              <h2>Grupo Propuesto:</h2>
              <ul>
                {proposedGroup.map((player, index) => (
                  <li key={index}>{player}</li>
                ))}
              </ul>
              <div className="voting-buttons">
                <button
                  onClick={() => submitVote('true')}
                  disabled={vote !== null}
                  className={`vote-button ${vote === 'true' ? 'voted' : ''}`}
                  aria-label="Votar a favor"
                >
                  &#128077; {/* Thumbs up emoji */}
                </button>
                <button
                  onClick={() => submitVote('false')}
                  disabled={vote !== null}
                  className={`vote-button ${vote === 'false' ? 'voted' : ''}`}
                  aria-label="Votar en contra"
                >
                  &#128078; {/* Thumbs down emoji */}
                </button>
              </div>

            </div>
          )}
          {allVoted && roundStatus === 'waiting-on-group' && imPartOfGroup(playerName) && (
            <div className="actions">
              <button
                onClick={() => submitAction(true)}
                disabled={action !== null}
                className="action-button"
              >
                Colaborar
              </button>
              {isEnemy(playerName) && (
                <button
                  onClick={() => submitAction(false)}
                  disabled={action !== null}
                  className="actions-button"
                >
                  Sabotear
                </button>
              )}
            </div>
          )}

          <div className="actions">
            {isOwner() && gameStatus === 'lobby' && (
              <button style={{marginTop: '10%'}} onClick={startGame}>Iniciar Juego</button>
            )}
            {imLeader() && gameStatus === 'rounds' && roundStatus === 'waiting-on-leader' &&(
              <>
                <button style={{marginTop: '10%'}} onClick={submitGroup}>Enviar Grupo</button>
              </>
            )}
          </div>
        </div>
        <ModalComponent
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          modalMessage={modalMessage}
        />
      </>
    </div>
  );
};

export default GameScreen;
