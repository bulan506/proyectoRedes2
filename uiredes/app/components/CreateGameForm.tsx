import React from "react";
import { Card, Button, Form } from "react-bootstrap";

const CreateGameForm = ({
  gameName,
  setGameName,
  gamePassword,
  setGamePassword,
  usePassword,
  handleCheckboxChange,
  handleCreateGame,
  setStage,
}: any) => {
  const isButtonDisabled =
    !gameName.trim() ||
    gameName.trim().length < 4 ||
    (usePassword && (!gamePassword.trim() || gamePassword.trim().length < 4));
  return (
    <Card className="text-center mt-5">
      <Card.Body style={{backgroundColor: '#393937'}}>
        <Card.Title style={{color: '#ECEADF'}}>Crear un Nuevo Juego</Card.Title>
        <Form onSubmit={(e) => handleCreateGame(e)}>
          <Form.Group className="mb-3">
            <Form.Label style={{color: '#ECEADF'}}>Nombre del Juego</Form.Label>
            <Form.Control
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Nombre del Juego"
              required
              maxLength={19}
            />
            {gameName.trim().length > 0 &&
                gameName.trim().length <=3 && (
                  <Form.Text className="text-danger">
                    El nombre del juego tiene que tener más de 4 caracteres y no más de 15 caracteres.
                  </Form.Text>
                )}
          </Form.Group>
          <div className="text-start px-3 py-2">
            <Form.Check
              type="checkbox"
              style={{color: '#ECEADF'}}
              label="Poner contraseña al juego"
              onChange={handleCheckboxChange}
            />
          </div>
          {usePassword && (
            <Form.Group className="mb-3">
              <Form.Label style={{color: '#ECEADF'}}>Contraseña del Juego</Form.Label>
              <Form.Control
                type="password"
                value={gamePassword}
                onChange={(e) => setGamePassword(e.target.value)}
                placeholder="Password"
                required
                maxLength={11}
              />
              {gamePassword.trim().length > 0 &&
                gamePassword.trim().length < 4 && (
                  <Form.Text className="text-danger">
                    La contraseña debe tener al menos 4 caracteres .
                  </Form.Text>
                )}
            </Form.Group>
          )}
          <Button
            variant="success"
            type="submit"
            className="mt-3"
            disabled={isButtonDisabled}
          >
            Crear Juego
          </Button>
          <Button
            variant="secondary"
            onClick={() => setStage("name")}
            className="mt-3"
          >
            Volver
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CreateGameForm;
