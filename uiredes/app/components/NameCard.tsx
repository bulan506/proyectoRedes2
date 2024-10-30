import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';

const NameCard = ({ playerName, setPlayerName, setStage, setSERVER }: any) => {
  const [server, setServer] = useState('http://localhost:5140/');
  const [nameError, setNameError] = useState('');

  const handleServerChange = (e: any) => {
    let input = e.target.value;
    if (input.length >= 10) {
      if (!input.endsWith('/')) {
        input += '/';
      }
    }
    setServer(input);
  };

  const handleNameChange = (e: any) => {
    const newName = e.target.value;
    if (newName.length <= 20) {
      setPlayerName(newName);
      setNameError('');
    } else {
      setNameError('El nombre no puede tener más de 20 caracteres.');
    }
  };

  const isFormValid = playerName.trim().length >= 4 && playerName.trim().length <= 20 && server.trim().length >= 10;

  const handleNameSubmit = (e: any) => {
    e.preventDefault();
    if (isFormValid) {
      setSERVER(server);
      setStage('games');
    }
  };

  const handleSearchByName = () => {
    if (isFormValid) {
      setSERVER(server);
      setStage('searchGameName');
    }
  };

  const handleCreateGame = () => {
    if (isFormValid) {
      setSERVER(server);
      setStage('create');
    }
  };

  return (
    <Card className="text-center mt-5" style={{width: '550px', backgroundColor: '#393937'}}>
      <Card.Body>
        <Card.Title style={{color: '#ECEADF'}}>Bienvenido al Juego</Card.Title>
        <Form onSubmit={handleNameSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{color: '#ECEADF'}}>Ingresa tu Nickname</Form.Label>
            <Form.Control
              type="text"
              value={playerName}
              onChange={handleNameChange}
              placeholder="Nickname"
              required
              maxLength={20}
            />
            {nameError && <Alert variant="danger">{nameError}</Alert>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label style={{color: '#ECEADF'}}>Ingresa la URL del Servidor</Form.Label>
            <Form.Control
              type="text"
              value={server}
              onChange={handleServerChange}
              placeholder="Servidor"
              required
              minLength={10}
            />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={handleNameSubmit} disabled={!isFormValid} style={{backgroundColor: '#D97757', borderColor: '#D97757'}}>
              Buscar un Juego
            </Button>
            <Button variant="secondary" onClick={handleSearchByName} disabled={!isFormValid}>
              Buscar por Nombre
            </Button>
            <Button variant="success" onClick={handleCreateGame} disabled={!isFormValid}>
              Crear un Juego
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default NameCard;