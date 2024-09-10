import React from 'react';
import { Container, Alert, Modal, Form, Button } from 'react-bootstrap';

const PasswordModal = ({ 
    show, 
    onHide, 
    gamePassword, 
    setGamePassword, 
    handlePasswordSubmit, 
    selectedGame 
  }) => {
    return (
      <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
          <Modal.Title>Ingresar al Juego</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={(e) => { e.preventDefault(); handlePasswordSubmit(selectedGame); }}>
            <Form.Group>
              <Form.Label>Ingrese la contraseña del juego</Form.Label>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={gamePassword}
                onChange={(e) => setGamePassword(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => handlePasswordSubmit(selectedGame)}>
            Unirse al Juego
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  export default PasswordModal;
  