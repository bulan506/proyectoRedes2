"use client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import ModalComponent from '@/app/components/ModalComponet';
const SERVER = process.env.NEXT_PUBLIC_SERVER;

const GameScreen = ({ game, password, playerName, onExit }: any) => {
  const [playerStatus, setPlayerStatus] = useState('');
  const [error, setError] = useState('');
  const [players, setPlayers] = useState(game.players || []);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');



  // Función para obtener los jugadores actualizados desde la API
  const fetchGameState = async () => {
    const headers:any = {
      'player': game.owner,
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
        setPlayers(data.data.players); // Actualizar los jugadores
      } else {
        console.error("Error al obtener el estado del juego:", response.status);
      }
    } catch (error) {
      console.error("Error en la solicitud GET:", error);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchGameState, 5000);
    return () => clearInterval(intervalId);
  }, [game.id, password, playerName]);

  const toggleStatus = () => {
    setPlayerStatus((prevStatus) =>
      prevStatus === 'ciudadano ejemplar' ? 'psicópata' : 'ciudadano ejemplar'
    );
  };

  const showModalWithMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  const isOwner = () => {
    return playerName.toLowerCase() === game.owner.toLowerCase() || game.owner.toLowerCase().includes(playerName.toLowerCase());
  };

  // Función para iniciar el juego
  const startGame = async () => {
    const data={
      player:game.owner
    };
    if (game.password) {
      data.password = password;
    }
    try {
      const response = await fetch(`${SERVER}api/games/${game.id}/start`, {
        method: 'HEAD',
        headers: data,
      });

      // Obtener el valor del encabezado "X-msg" si existe
      const errorMsg = response.headers.get('X-msg');
      // Manejar diferentes códigos de estado
      if (response.status === 200) {
        showModalWithMessage('El juego ha comenzado exitosamente.');
      } else if (response.status === 401) {
        showModalWithMessage(`No autorizado: ${errorMsg || 'Sin mensaje'}`);
      } else if (response.status === 403) {
        showModalWithMessage(`Acceso prohibido: usted no es un owner`);
      } else if (response.status === 404) {
        showModalWithMessage(`Juego no encontrado: ${errorMsg || 'Sin mensaje'}`);
      } else if (response.status === 409) {
        showModalWithMessage(`El juego ya ha comenzado: ${errorMsg || 'Sin mensaje'}`);
      } else if (response.status === 428) {
        showModalWithMessage(`Se necesitan 5 jugadores para comenzar: ${errorMsg || 'Sin mensaje'}`);
      } else {
        showModalWithMessage(`Error desconocido: ${response.status}`);
      }

    } catch (error) {
      setError(`Error al iniciar el juego: ${error.message}`);
      console.error('Error al iniciar el juego:', error);
    }
  };

  return (
    <div>
      <h1>Game ID: {game.id}</h1>
      <h1>NOMBRE DEL JUGADOR: {playerName}</h1>
      <h1>Password: {password}</h1>

      <>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="game-interface">
          <div className="player-info">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/7/73/Trollface.png"
              alt="Foto del Jugador"
              className="player-photo"
            />
            <p>{playerName}</p>
            <p
              className={`player-status ${playerStatus === 'ciudadano ejemplar' ? 'status-good' : 'status-bad'}`}
            >
              {playerStatus}
            </p>
          </div>
          <div className="players-div">
            {/* Renderizar jugadores en círculos */}
            {players.map((player, index) => (
              <div key={index} className="player-circle">
                <p>{player}</p>
              </div>
            ))}
          </div>
          <div className="actions">
            <button>Trabajar</button>
            <button>Sabotear</button>
            <button onClick={toggleStatus}>Cambiar Estado</button>
            {isOwner() && (
              <button onClick={startGame}>Iniciar Juego</button>
            )}        
            <button variant="outline-secondary" className="exit-button" onClick={onExit}>Salir del Juego</button> {/* Botón para salir */}
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
