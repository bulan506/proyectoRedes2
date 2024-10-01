"use client";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Alert, Modal, Form, Button } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import ModalComponent from '@/app/components/ModalComponet';
import GameScreen from '@/app/GameScreen/GameScreen';
import NameCard from '@/app/components/NameCard';
import CreateGameForm from '@/app/components/CreateGameForm';
import GamesList from '@/app/components/GamesList';
import PasswordModal from '@/app/components/passwordModal';
import SearchByName from '@/app/components/SearchByName';


export default function GamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [gamePassword, setGamePassword] = useState('');
  const [stage, setStage] = useState('name');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [gameID, setGameId] = useState(false);
  const [gameOwner, setGameOwner] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState([]);
  const [usePassword, setUsePassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [gamesPerPage] = useState(150);
  const [SERVER, setSERVER] = useState('');

  useEffect(() => {
    if (stage === 'games') {
      fetchGames();
    }
  }, [stage, currentPage]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${SERVER}api/games?page=${currentPage}&limit=${gamesPerPage}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
     
      const data = await response.json();
      setGames(data.data);
      setTotalPages(15);
    } catch (err) {
      setGames([])
      showModalWithMessage('Ha ocurrido un error al hacer la solicitud, vuelva al inicio.');
      return;
    }
  };

  const fetchCreateGames = async (e) => {
    e.preventDefault();
    if (!gameName.trim() || !playerName.trim()) {
      showModalWithMessage('Error: El nombre del juego y el nombre del jugador son requeridos.');
      return;
    }
    const data = {
      name: gameName,
      owner: playerName,
    };
    if (usePassword) {
      if (!gamePassword.trim() || gamePassword.length < 2) {
        showModalWithMessage('Error: no se pueden crear juegos con contraseñas vacías o demasiado cortas.');
        return;
      }
      data.password = gamePassword;
    }
    try {
      const response = await fetch(`${SERVER}api/games/`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });
      const dataResponse = await response.json();

      if (response.status === 200 || response.status === 403) {
        const gameIdentification = dataResponse.data.id;
        const gameOwner = dataResponse.data.owner;
        setGameId(gameIdentification);
        setGameOwner(gameOwner);
        setUsePassword(dataResponse.data.password)
        setSelectedGame(dataResponse.data)
        showModalWithMessage('El juego ha sido creado exitosamente.');
        setStage('match')
      } else if (response.status === 400 || response.status === 409) {
        showModalWithMessage('Error: ' + dataResponse.msg);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      showModalWithMessage('Ha ocurrido un error por favor vuelva al incio');
      console.error('Error fetching games:', err);
    }
  };


  const showModalWithMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleJoinGame = (game) => {
    if (game.players.length >= 10) {
      showModalWithMessage('Este juego ya tiene el máximo de 10 jugadores.');
      return;
    }
    setSelectedGame(game);
    if (game.password) {
      setShowPasswordModal(true);
    } else {
      handlePasswordSubmit(game);
    }
  };

  const handlePasswordSubmit = async (game) => {
    const currentGame = game || selectedGame;
    if (currentGame.players.length >= 10) {
      showModalWithMessage('Este juego ya tiene el máximo de 10 jugadores.');
      return;
    }
    if (selectedGame && selectedGame.password && (gamePassword.trim() == '' || gamePassword.trim().length < 2)) {
      showModalWithMessage('La contraseña no puede estar vacía, o no cumple con el estandard');
      return;
    }
    const requestData = currentGame?.password ? { player: playerName, password: gamePassword } : { player: playerName };
    const headers = {
      'Content-Type': 'application/json',
      ...(selectedGame?.password && { 'password': gamePassword }),
      ...(selectedGame && { 'player': playerName })
    };

    try {
      const response = await fetch(`${SERVER}api/games/${currentGame.id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      if (response.status === 200) {
        if (data.data.players.length > 10) {
          showModalWithMessage('Lo sentimos, el juego ya está lleno (10 jugadores máximo).');
          return;
        }
        setGameId(selectedGame.id);
        setStage('match');
        setShowPasswordModal(false);
        setGamePassword(gamePassword);
        setGameOwner(data.data.owner)
        setUsePassword(data.data.password)
        setSelectedGame(data.data)
      } else if (response.status === 402 || response.status === 404 || response.status === 409 || response.status === 428 || response.status === 403) {
        showModalWithMessage(data.msg);
      } else if (response.status === 400) {
        showModalWithMessage(data.msg);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error al unirse al juego:', error);
    }
  };

  const handleCheckboxChange = (event) => {
    setUsePassword(event.target.checked);
    if (!event.target.checked) {
      setGamePassword('');
    }
  };

  return (
    <Container>
      {stage === 'name' && (
        <NameCard
          playerName={playerName}
          setPlayerName={setPlayerName}
          setStage={setStage}
          setSERVER={setSERVER}
        />
      )}
      {stage === 'create' && (
        <CreateGameForm
          gameName={gameName}
          setGameName={setGameName}
          gamePassword={gamePassword}
          setGamePassword={setGamePassword}
          usePassword={usePassword}
          handleCheckboxChange={handleCheckboxChange}
          handleCreateGame={fetchCreateGames}
          setStage={setStage}
        />
      )}
      {stage === 'games' && (
        <GamesList
          games={games}
          error={error}
          handleJoinGame={handleJoinGame}
          setStage={setStage}
          setSelectedGame={setSelectedGame}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}
      
      {stage === 'match' && (
        <GameScreen
          game={selectedGame}
          password={gamePassword}
          playerName={playerName}
          SERVER={SERVER}
        />
      )}
      {stage === 'searchGameName' && (
        <SearchByName 
        handleJoinGame={handleJoinGame}
        setSelectedGame={setSelectedGame}
        setStage={setStage}
        SERVER={SERVER}
        />
      )}
      <ModalComponent
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        modalMessage={modalMessage}
      />
      <PasswordModal 
        show={showPasswordModal} 
        onHide={() => setShowPasswordModal(false)} 
        gamePassword={gamePassword}
        setGamePassword={setGamePassword}
        handlePasswordSubmit={handlePasswordSubmit}
        selectedGame={selectedGame}
      />
    </Container>
  );
}