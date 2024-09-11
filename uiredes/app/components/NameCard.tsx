import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';

const NameCard = ({ playerName, setPlayerName, setStage }:any) => {
  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStage('games');
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
          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={() => setStage('games')}
              disabled={playerName.trim().length < 4}
            >
              Buscar un Juego
            </Button>
            <Button
              variant="secondary"
              onClick={() => alert("Buscar por Nombre aún no implementado")}
              disabled={playerName.trim().length < 4}
            >
              Buscar por Nombre
            </Button>
            <Button
              variant="success"
              onClick={() => setStage('create')}
              disabled={playerName.trim().length < 4}
            >
              Crear un Juego
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NameCard;
