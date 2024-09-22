import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';

const NameCard = ({ playerName, setPlayerName, setStage, setSERVER }: any) => {
  const [server, setServer] = useState('');

  const handleServerChange = (e: any) => {
    let input = e.target.value;
    if (input.length >= 10) {
      if (!input.endsWith('/')) {
        input += '/';
      }
    }
    setServer(input);
  };
  const isFormValid = playerName.trim().length >= 4 && server.trim().length >= 10;

  const handleNameSubmit = (e: any) => {
    e.preventDefault();
    if (isFormValid) {
      setSERVER(server);
      setStage('games');
    }
  };

  const handleSearchByName = () => {
    if (isFormValid) {
      setSERVER(server);
      setStage('searchGameName');
    }
  };

  return (
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
          <Form.Group className="mb-3">
            <Form.Label>Ingresa la URL del Servidor</Form.Label>
            <Form.Control
              type="text"
              value={server}
              onChange={handleServerChange}
              placeholder="Servidor"
              required
              minLength={10}
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handleNameSubmit} disabled={!isFormValid}>
              Buscar un Juego
            </Button>
            <Button variant="secondary" onClick={handleSearchByName} disabled={!isFormValid}>
              Buscar por Nombre
            </Button>
            <Button variant="success" onClick={() => setStage('create')} disabled={!isFormValid}>
              Crear un Juego
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NameCard;
