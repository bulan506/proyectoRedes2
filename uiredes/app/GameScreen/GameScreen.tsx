import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import "@/app/styles/VoteButtons.css";
import "@/app/styles/ScoreboardStyles.css";
import ModalComponent from '@/app/components/ModalComponet';
import PlayerInfo from "@/app/GameScreen/PlayerInfo";
import PlayersList from "@/app/GameScreen/PlayersList";
import VotingButtons from "@/app/GameScreen/VotingButtons";
import ProposedGroup from "@/app/GameScreen/ProposedGroup";
import Actions from "@/app/GameScreen/Actions";
import { set } from "zod";


const GameScreen = ({ game, password, playerName, SERVER }: any) => {
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
  const [lastProcessedRound, setLastProcessedRound] = useState('');

  const [citizensScore, setCitizensScore] = useState(0);
  const [enemiesScore, setEnemiesScore] = useState(0);

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
        if (gameStatus === 'ended') { 
          countWinner();
        }
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
        if (data.data.status === 'ended' && currentRound !== lastProcessedRound) {
          setLastProcessedRound(currentRound);
          //fetchGameState();
          if(data.data.result === 'citizens'){
            showModalWithMessage('¡Los ciudadanos ganaron la ronda!');
            setCitizensScore(citizensScore + 1);
          }else if(data.data.result === 'enemies'){
            showModalWithMessage('¡Los enemigos ganaron la ronda!');
            setEnemiesScore(enemiesScore + 1);
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
        fetchRoundInfo(); 
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
      const intervalId = setInterval(fetchGameState, 2000);
      return () => clearInterval(intervalId);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'rounds') {
      const intervalId = setInterval(fetchRoundInfo, 2000);
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

      if (response.status === 200) {
        showModalWithMessage('El juego ha comenzado exitosamente.');
        fetchGameState();
      } else {
        const statusMessages: any = {
          401: `No autorizado: ${response.msg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: usted no es un owner',
          404: `Juego no encontrado: ${response.msg  || 'Sin mensaje'}`,
          409: `El juego ya ha comenzado: ${response.msg || 'Sin mensaje'}`,
          428: `Se necesitan 5 jugadores para comenzar: ${response.msg || 'Sin mensaje'}`,
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
      {/*<h1>Nombre del Juego: {game.name}</h1>*/}
      {/*{leader && (<h1>El lider es: {leader}</h1>)}*/}
      {/*{roundStatus && (<h1>El estado de la partida es: {roundStatus}</h1>)}*/}
      {/*{error && <Alert variant="danger">{error}</Alert>}*/}

      <div className="game-interface">
        <div className="league">ContaminaDOS</div>
        <div className="half">{game.name}</div>
        <div className="half">Líder: {leader}</div>
        <div className="scoreSection">
          <div className="team">
            <button style={{background: 'none', border: 'none'}}>&#129489;</button>
            <span>Ciudadanos</span>
          </div>
          <div className="score">{citizensScore} : {enemiesScore}</div>
          <div className="team">
            <span>Enemigos</span>
            <button style={{background: 'none', border: 'none'}}>&#129399;</button>
          </div>
        </div>
        {/*<div className="half">{roundNumber}</div>*/}
        <div className="time">{roundStatus}</div>
      </div>

            
      <div className="game-interface">
      <PlayerInfo playerName={playerName} isEnemy={isEnemy(playerName)} isLeader={imLeader()} />
      <PlayersList players={players} selectedGroup={selectedGroup} isLeader={imLeader()} isEnemy={isEnemy(playerName)} setSelectedGroup={setSelectedGroup} isEnemyF={isEnemy}/>
        
        {imLeader() && roundStatus === 'waiting-on-leader' && (
          <>
            <div className="selected-group-info">
              <h2 className="label">Grupo Seleccionado:</h2>
              <ul>{selectedGroup.map((player, index) => (<li className="label" key={index}>{player}</li>))}</ul>
            </div>
          </>
        )}

        {proposedGroup.length > 0 && roundStatus === 'voting' && (<>
          <ProposedGroup proposedGroup={proposedGroup} />
          <VotingButtons vote={vote} roundStatus={roundStatus} submitVote={submitVote} />
        </>)}

        {allVoted && roundStatus === 'waiting-on-group' && imPartOfGroup(playerName) && (
        <Actions playerName={playerName} enemies={enemies} action={action} submitAction={submitAction} />
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
    </div>
  );
};

export default GameScreen;
