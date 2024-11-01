import React from 'react';
import { Container, ListGroup, Button, Alert , Pagination } from 'react-bootstrap';

const GamesList = ({ games, error, handleJoinGame, setStage, setSelectedGame, currentPage, totalPages, handlePageChange }:any) => { 
   return (
    <Container className="player-info">
      <h2 className="text-center" style={{color: '#ECEADF'}}>Juegos Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
      <ListGroup  className="players-div">
        {games.map((game: any) => (
          <ListGroup.Item
            key={game.id}
            className="d-flex justify-content-between align-items-center"
            style={{width: '625px', backgroundColor: '#393937'}}
          >
            <div style={{color: '#D97757'}}>
              <strong>{game.name}</strong>
              <span  style={{color: '#ECEADF'}}> - Estado: {game.status}</span>
              <span  style={{color: '#ECEADF'}}> - Jugadores: {game.players.length}/10</span>
              <span  style={{color: '#ECEADF'}}> - Contraseña: {game.password ? 'Sí' : 'No'}</span>
            </div>
            <Button
              variant="primary"
              style={{backgroundColor: '#D97757', borderColor: '#D97757'}}
              onClick={() => {
                setSelectedGame(game);
                handleJoinGame(game);
              }}
              disabled={game.players.length >= 10 || game.status === 'rounds' ||game.status === 'ended'}
            >
              {game.players.length >= 10 ? 'Lleno' : 'Jugar'}
            </Button>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <div className="players-div">
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
      </div>

      <Button variant="secondary" onClick={() => setStage('name')} className="mt-3">
        Volver
      </Button>
    </Container>
  );
};

export default GamesList;
