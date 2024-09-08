"use client";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Form, Container, Row, Col, ListGroup, Alert, Modal } from 'react-bootstrap';
import "@/app/styles/GameInterface.css";
import ModalComponent from '@/app/components/ModalComponet';
import GameScreen from '@/app/GameScreen/GameScreen';
const SERVER = process.env.NEXT_PUBLIC_SERVER;

export default function GamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [gamePassword, setGamePassword] = useState('');
  const [stage, setStage] = useState('name'); // 'name', 'games', 'create', 'match'
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [gameID, setGameId] = useState(false);
  const [gameOwner, setGameOwner] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState([]);
  const [usePassword, setUsePassword] = useState(false);

  useEffect(() => {
    if (stage === 'games') {
      fetchGames();
    }
  }, [stage]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${SERVER}api/games/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGames(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    }
  };

  const fetchCreateGames = async () => {
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
        method: 'POST', // Método POST para crear partidas
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
      showModalWithMessage('Error: ' + err.message);
      console.error('Error fetching games:', err);
    }
  };

  const handleNameSubmit = (e: any) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStage('games');
    }
  };

  const showModalWithMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleCreateGame = (e: any) => {
    e.preventDefault();
    fetchCreateGames();
  };

  const handleJoinGame = (game) => {
   setSelectedGame(game)
    if (game.password) {
      setShowPasswordModal(true);
    } else {
      handlePasswordSubmit(game);
    }
  };

  const handlePasswordSubmit = async (game) => {
    const currentGame = game || selectedGame;
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


  const renderNameCard = () => (
    <Card className="text-center mt-5">
      <Card.Body>
        <Card.Title>Bienvenido al Juego</Card.Title>
        <Form onSubmit={handleNameSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ingresa tu Nickname</Form.Label>
            <Form.Control
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Nickname"
              required
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={() => setStage('games')} disabled={playerName.trim().length < 4} >
              Buscar un Juego
            </Button>
            <Button
              variant="secondary"
              onClick={() => alert("Buscar por Nombre aún no implementado")}
              disabled={playerName.trim().length < 4}>
              Buscar por Nombre
            </Button>
            <Button variant="success" onClick={() => setStage('create')} disabled={playerName.trim().length < 4} >
              Crear un Juego
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderCreateGameForm = () => (
    <Card className="text-center mt-5">
      <Card.Body>
        <Card.Title>Crear un Nuevo Juego</Card.Title>
        <Form onSubmit={handleCreateGame}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre del Juego</Form.Label>
            <Form.Control
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Nombre del Juego"
              required
            />
          </Form.Group>
          <div className="text-start px-3 py-2">
            <Form.Check
              type="checkbox"
              label="Poner contraseña al juego"
              onChange={handleCheckboxChange}
            />
          </div>
          {usePassword && (
            <Form.Group className="mb-3">
              <Form.Label>Password del Juego</Form.Label>
              <Form.Control
                type="password"
                value={gamePassword}
                onChange={(e) => setGamePassword(e.target.value)}
                placeholder="Password"
                required
              />
            </Form.Group>
          )}
          <Button variant="success" type="submit" className="mt-3">
            Crear Juego
          </Button>
          <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
            Volver
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  const renderGamesList = () => (
    <Container className="mt-5">
      <h2 className="text-center">Juegos Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <ListGroup>
        {games.map((game) => (
          <ListGroup.Item
            key={game.id}
            className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{game.name}</strong>
              <span className="text-muted"> - Estado: {game.status}</span>
              <span className="text-muted"> - Jugadores: {game.players.length}/10</span>
              <span className="text-muted"> - Contraseña: {game.password ? 'Sí' : 'No'}</span>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedGame(game);
                handleJoinGame(game);
              }}
            >
              Jugar
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
    </Container>
  );

  return (
    <Container>
      <>
        {stage === 'name' && renderNameCard()}
        {stage === 'create' && renderCreateGameForm()}
        {stage === 'games' && renderGamesList()}
        {stage === 'match' && <GameScreen game={selectedGame} password={gamePassword} playerName={playerName} />}
        <ModalComponent
          showModal={showModal}
          handleCloseModal={handleCloseModal}
          modalMessage={modalMessage}
        />
        <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ingresar al Juego</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(); }}>
              <Form.Group>
                <Form.Label>Ingrese la contraseña del juego</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Contraseña"
                  value={gamePassword}
                  onChange={(e) => setGamePassword(e.target.value)}
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handlePasswordSubmit}>
              Unirse al Juego
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    </Container>
  );
};
