"use client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
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
        if (gameStatus === 'rounds') { fetchRoundInfo() }
      } else {
        showModalWithMessage(`Error: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error en la solicitud GET: ${error.message}`);
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
        setLeader(data.data.leader);
      } else {
        showModalWithMessage(`Error al obtener la ronda: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Error en la solicitud GET de ronda: ${error.message}`);
    }
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
      if (response.ok) {
        showModalWithMessage('Grupo enviado exitosamente.');
      } else {
        const statusMessages: any = {
          401: `Credenciales inválidas: ${errorMsg || 'Sin mensaje'}`,
          403: 'Acceso prohibido: solo el líder puede enviar el grupo',
          404: `Ronda no encontrada: ${errorMsg || 'Sin mensaje'}`,
        };
        showModalWithMessage(statusMessages[response.status] || `Error desconocido: ${response.status}`);
      }
    } catch (error) {
      setError(`Error al enviar el grupo: ${error.message}`);
      console.error('Error al enviar el grupo:', error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchGameState, 3000);
    if (gameStatus === 'rounds') {
      clearInterval(intervalId); // Detener el polling cuando el estado sea 'rounds'
      fetchGameState();
    }
    return () => clearInterval(intervalId);
  }, [gameStatus]);

  const isOwner = () => playerName.toLowerCase() === game.owner.toLowerCase();
  const isEnemy = (player) => enemies.includes(player);
  const imLeader = () => playerName === leader;

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
      <h1>Pantalla del Juego: {game.id}</h1>
      <h1>NOMBRE DEL JUGADOR: {playerName}</h1>
      <h1>Password: {password}</h1>
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
          {imLeader() &&  (
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


          <div className="actions">
            {isOwner() && gameStatus === 'lobby' && (
              <button onClick={startGame}>Iniciar Juego</button>
            )}
            {imLeader() && gameStatus === 'rounds' && (
              <>
                <button onClick={submitGroup}>Enviar Grupo</button>
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
