"use client";
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS
import React, { useState, useEffect } from 'react';
import {  Alert } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import ModalComponent from '@/app/components/ModalComponet'; // Ajusta la ruta según sea necesario
const SERVER = process.env.NEXT_PUBLIC_SERVER;


const GameScreen = ({ gameID, playerName, password }: any) => {
  const [playerStatus, setPlayerStatus] = useState('');
  const [error, setError] = useState(null);
  const [playerNameInterface, setplayerNameInterface] = useState('');
  const [players, setPlayers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    console.log(`Mostrando pantalla del juego para el ID: ${gameID}`);
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
        setPlayers(data.players);
      } else if (response.status === 401 || response.status === 403 || response.status === 404) {
        showModalWithMessage(data.msg);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

    } catch (error) {
      setError(error.message);
      console.error('Error getting game data:', error);
    }
  };
  const playersTest = ['Jugador 1', 'Jugador 2', 'Jugador 3', 'Jugador 4', 'hola jaja'];

  return (
    <div>
      <h1>Pantalla del Juego: {gameID}</h1>
      <h1>NOMBRE DEL JUGADOR: {playerName}</h1>
      <h1>password: {password}</h1>


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
          {/* Renderizar jugadores como círculos */}
          {playersTest.map((player, index) => (
            <div key={index} className="player-circle">
              <p>{player}</p>
            </div>
          ))}
        </div>
          <div className="actions">
            <button>Trabajar</button>
            <button>Sabotear</button>
            <button onClick={toggleStatus}>Cambiar Estado</button>
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

