import React from 'react';
import { Container, ListGroup, Button, Alert , Pagination } from 'react-bootstrap';

const GamesList = ({ games, error, handleJoinGame, setStage, setSelectedGame, currentPage, totalPages, handlePageChange }:any) => { 
   return (
    <Container className="mt-5">
      <h2 className="text-center">Juegos Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
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
      <Pagination className="mt-3 justify-content-center">
      <Pagination.First onClick={() => handlePageChange(0)} disabled={currentPage === 0} />
      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} />
      {[...Array(totalPages)].map((_, i) => (
      <Pagination.Item
         key={i}
         active={i === currentPage}
         onClick={() => handlePageChange(i)}
      >
           {i}
       </Pagination.Item>
       ))}
      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} />
      <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={currentPage === totalPages - 1} />
      </Pagination>

      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
    </Container>
  );
};

export default GamesList;
