import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Button, Alert, Pagination, Form } from 'react-bootstrap';

const GamesList = ({ error, handleJoinGame, setStage, setSelectedGame, SERVER }: any) => {
  const [filterStatus, setFilterStatus] = useState('');
  const [filteredGames, setFilteredGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = 19; // Siempre muestra 19 páginas

  const fetchGames = async (page = 0, status = '') => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());

      if (status && status !== '') {
        queryParams.append('status', status);
      }

      const response = await fetch(`${SERVER}api/games?${queryParams.toString()}&limit=150`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener los juegos. Status code: ${response.status}`);
      }

      const data = await response.json();
      setFilteredGames(data.data || []);
    } catch (error) {
      console.error('Error:', error);
      setFilteredGames([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchGames(page, filterStatus);
  };

  useEffect(() => {
    fetchGames(currentPage, filterStatus);
  }, [filterStatus, currentPage]);

  return (
    <Container className="player-info">
      <h2 className="text-center" style={{ color: '#ECEADF' }}>Juegos Disponibles</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form.Group controlId="filterStatus" className="d-flex align-items-center justify-content-center mt-3">
        <Form.Label className="mr-2" style={{ color: '#ECEADF' }}>Estado:</Form.Label>
        <Form.Control
          as="select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ width: '150px', marginRight: '10px' }}
        >
          <option value="">todos</option>
          <option value="lobby">lobby</option>
          <option value="rounds">rounds</option>
          <option value="ended">ended</option>
        </Form.Control>
      </Form.Group>

      <ListGroup className="players-div mt-3">
        {loading ? (
          <Alert variant="info">Cargando juegos...</Alert>
        ) : filteredGames.length > 0 ? (
          filteredGames.map((game: any) => (
            <ListGroup.Item
              key={game.id}
              className="d-flex justify-content-between align-items-center"
              style={{ width: '625px', backgroundColor: '#393937' }}
            >
              <div style={{ color: '#D97757' }}>
                <strong>{game.name}</strong>
                <span style={{ color: '#ECEADF' }}> - Estado: {game.status}</span>
                <span style={{ color: '#ECEADF' }}> - Jugadores: {game.players.length}/10</span>
                <span style={{ color: '#ECEADF' }}> - Contraseña: {game.password ? 'Sí' : 'No'}</span>
              </div>
              <Button
                variant="primary"
                style={{ backgroundColor: '#D97757', borderColor: '#D97757' }}
                onClick={() => {
                  setSelectedGame(game);
                  handleJoinGame(game);
                }}
                disabled={game.players.length >= 10 || game.status === 'rounds' || game.status === 'ended'}
              >
                {game.players.length >= 10 ? 'Lleno' : 'Jugar'}
              </Button>
            </ListGroup.Item>
          ))
        ) : (
          <Alert variant="info">No se encontraron juegos para el estado seleccionado.</Alert>
        )}
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
              {i + 1}
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
