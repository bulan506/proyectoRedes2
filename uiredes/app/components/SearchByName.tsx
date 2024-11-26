import React, { useState } from 'react';
import { Container, ListGroup, Button, Alert, Form} from 'react-bootstrap';
import ModalComponent from '@/app/components/ModalComponet'; // Importa el componente modal

const SearchByName = ({ handleJoinGame, setSelectedGame ,setStage ,SERVER}: any) => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [gamesState, setGamesState] = useState([]);
  const [gameName, setGameName] = useState('');

  const handleCloseModal = () => setShowModal(false);
  const handleSearchByName = async () => {
    if (gameName.trim().length < 2) {
      setModalMessage('El nombre del juego debe tener al menos 2 caracteres para buscar.');
      setShowModal(true);
      return;
    }
    try {
      const response = await fetch(
        `${SERVER}api/games?name=${gameName}`,
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
      setModalMessage('Ha ocurrido un error en la solicitud, por favor vuelva al inicio.');
      setShowModal(true);
    }
  };

  return (
    <Container className="mt-5">
        <div className="mt-3">
              <Form.Group className="mb-3">
                <Form.Label style={{color: '#ECEADF'}}>Ingresa el Nombre del Juego</Form.Label>
                <Form.Control
                  type="text"
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Nombre del Juego"
                  required
                />
              </Form.Group>
              <Button
                variant="info"
                style={{backgroundColor: '#D97757', borderColor: '#D97757'}}
                onClick={handleSearchByName}
                disabled={gameName.trim().length <=2}
              >
                Buscar
              </Button>
            </div>     
      <ListGroup>
        {gamesState.map((game: any) => (
          <ListGroup.Item
            key={game.id}
            className="d-flex justify-content-between align-items-center"
            style={{width: '625px', backgroundColor: '#393937'}}
          >
            <div style={{color: '#D97757'}}>
              <strong>{game.name}</strong>
              <span style={{color: '#ECEADF'}}> - Estado: {game.status}</span>
              <span style={{color: '#ECEADF'}}> - Jugadores: {game.players.length}/10</span>
              <span style={{color: '#ECEADF'}}> - Contraseña: {game.password ? 'Sí' : 'No'}</span>
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
