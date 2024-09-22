import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';

const CreateGameForm = ({
  gameName,
  setGameName,
  gamePassword,
  setGamePassword,
  usePassword,
  handleCheckboxChange,
  handleCreateGame,
  setStage,
}:any) => {
  return (
    <Card className="text-center mt-5">
      <Card.Body>
        <Card.Title>Crear un Nuevo Juego</Card.Title>
        <Form onSubmit={(e) => handleCreateGame(e)}>
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
};

export default CreateGameForm;
