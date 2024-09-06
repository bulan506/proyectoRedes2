"use client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import ModalComponent from '@/app/components/ModalComponet'; // Ajusta la ruta según sea necesario
const SERVER = process.env.NEXT_PUBLIC_SERVER;

const GameScreen = ({ gameID, playerName, password }: any) => {
  const [playerStatus, setPlayerStatus] = useState('');
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    console.log(`Mostrando pantalla del juego para el ID: ${gameID}`);
    fetchGameData(gameID, playerName); // Llamada para obtener los datos del juego
  }, [gameID]);

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

  // Función para obtener los datos del juego desde la API
  const fetchGameData = async (gameId: string, playerN: string) => {
    try {
      const response = await fetch(`${SERVER}api/games/${gameId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          player: playerN,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (response.status === 200) {
        setPlayers(data.players); // Guardar los jugadores en el estado
      } else if (response.status === 401 || response.status === 403 || response.status === 404) {
        showModalWithMessage(data.msg);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      setError(error.message);
      console.error('Error obteniendo datos del juego:', error);
    }
  };

  // Datos de jugadores "quemados"
  const playersTest = [
    { name: 'Jugador 1' },
    { name: 'Jugador 2' },
    { name: 'Jugador 3' },
    { name: 'Jugador 4' },
    { name: 'hola jaja' }
  ];

 // Función para iniciar el juego
const startGame = async () => {
  try {
    // Realizar la solicitud HTTP HEAD
    const response = await fetch(`${SERVER}api/games/${gameID}/start`, {
      method: 'HEAD',
      headers: {
        'password': password, // Encabezado de password
        'player': playerName, // Encabezado de player
      },
    });

    // Obtener el valor del encabezado "X-msg" si existe
    const errorMsg = response.headers.get('X-msg');

    // Manejar diferentes códigos de estado
    if (response.status === 200) {
      showModalWithMessage('El juego ha comenzado exitosamente.');
    } else if (response.status === 401) {
      showModalWithMessage(`No autorizado: ${errorMsg || 'Sin mensaje'}`);
    } else if (response.status === 403) {
      showModalWithMessage(`Acceso prohibido: ${errorMsg || 'Sin mensaje'}`);
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
      <h1>Pantalla del Juego: {gameID}</h1>
      <h1>NOMBRE DEL JUGADOR: {playerName}</h1>
      <h1>Password: {password}</h1>

      <>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="game-interface">
          <div className="player-info">
            <img
              src="https://via.placeholder.com/150"
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
            {/* Renderizar jugadores "quemados" */}
            {playersTest.map((player, index) => (
              <div key={index} className="player-circle">
                <p>{player.name}</p>
              </div>
            ))}
          </div>
          <div className="actions">
            <button>Trabajar</button>
            <button>Sabotear</button>
            <button onClick={toggleStatus}>Cambiar Estado</button>
            <button onClick={startGame}>Iniciar Juego</button> {/* Botón para iniciar el juego */}
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
