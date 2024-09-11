import React from 'react';
import { Container, ListGroup, Button, Alert } from 'react-bootstrap';

const GamesList = ({ games, error, handleJoinGame, setStage, setSelectedGame }: any) => {
  return (
    <Container className="mt-5">
      <h2 className="text-center">Juegos Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <ListGroup>
        {games.map((game: any) => (
          <ListGroup.Item
            key={game.id}
            className="d-flex justify-content-between align-items-center"
          >
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
              {game.players.length >= 10 ? 'Lleno' : 'Jugar'}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
    </Container>
  );
};

export default GamesList;
