import React, { useState } from 'react';
import { Container, ListGroup, Button, Alert, Form} from 'react-bootstrap';
import ModalComponent from '@/app/components/ModalComponet'; // Importa el componente modal

const SearchByName = ({ handleJoinGame, setSelectedGame ,setStage}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [gamesState, setGamesState] = useState([]);
  const [gameName, setGameName] = useState('');

  const handleCloseModal = () => setShowModal(false);
  const handleSearchByName = async () => {
    if (gameName.trim().length < 4) {
      setModalMessage('El nombre del juego debe tener al menos 4 caracteres para buscar.');
      setShowModal(true);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}api/games?name=${gameName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
         if (data.data.length === 0) {
            setModalMessage(`No se encontraron juegos de nombre: '${gameName}'`);
            setShowModal(true);
         } 
        setGamesState(data.data);
      }else{
        setModalMessage('Ha ocurrido un error en la solicitud, por favor vuelva al inicio.');
        setShowModal(true);
      }
    } catch (err: any) {
        throw new Error(`Error HTTP! status: ${err}`);
    }
  };

  return (
    <Container className="mt-5">
        <div className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label>Ingresa el Nombre del Juego</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Nombre del Juego"
                  required
                />
              </Form.Group>
              <Button
                variant="info"
                onClick={handleSearchByName}
                disabled={gameName.trim().length < 4}
              >
                Buscar
              </Button>
            </div>     
      <ListGroup>
        {gamesState.map((game: any) => (
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
      <ModalComponent
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        modalMessage={modalMessage}
      />
    </Container>
  );
};

export default SearchByName;
