"use client";
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button, Form, Container, Row, Col, ListGroup, Alert, Modal } from 'react-bootstrap';

const SERVER = process.env.NEXT_PUBLIC_SERVER;


export default function GamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [gameName, setGameName] = useState('');
  const [gamePassword, setGamePassword] = useState('');
  const [stage, setStage] = useState('name'); // 'name', 'games', 'create'
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

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
      password: gamePassword,
    };

    try {
      const response = await fetch(`${SERVER}api/games/`, {
        method: 'POST', // Método POST para crear partidas
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data), // Convertir el cuerpo de la solicitud a JSON
      });
      const dataResponse = await response.json();

      if (response.status === 200) {
        setGames([...games, dataResponse.data]); // Añadir nuevo juego creado a la lista
        showModalWithMessage('El juego ha sido creado exitosamente.');
      } else if (response.status === 400) {
        showModalWithMessage('Error del cliente: ' + dataResponse.msg);
      } else if (response.status === 403) {
        showModalWithMessage('Error 403: No autorizado.');
      } else if (response.status === 409) {
        showModalWithMessage('Conflicto: ' + dataResponse.msg);
      } else {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (err) {
      setError(err.message);
      showModalWithMessage('Error: ' + err.message);
      console.error('Error fetching games:', err);
    }
  };
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStage('games');
    }
  };

  const showModalWithMessage = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handleCreateGame = (e) => {
    e.preventDefault();
    fetchCreateGames();
    setGameName('');
    setGamePassword('');
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
            <Button variant="primary" onClick={() => setStage('games')}>
              Buscar un Juego
            </Button>
            <Button variant="secondary" onClick={() => alert("Buscar por Nombre aún no implementado")}>
              Buscar por Nombre
            </Button>
            <Button variant="success" onClick={() => setStage('create')}>
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
          <ListGroup.Item key={game.id} className="d-flex justify-content-between align-items-center">
            {game.name}
            <Button variant="primary" onClick={() => alert("Función jugar aún no implementada")}>
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
      {stage === 'name' && renderNameCard()}
      {stage === 'create' && renderCreateGameForm()}
      {stage === 'games' && renderGamesList()}

      {/* Modal para mensajes de éxito o error */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Mensaje del Servidor</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMessage}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}