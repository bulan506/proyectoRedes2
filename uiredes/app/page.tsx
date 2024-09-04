"use client";
import React, { useEffect, useState } from 'react';
const SERVER = process.env.NEXT_PUBLIC_SERVER;

export default function GamePage() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [stage, setStage] = useState('name'); // 'name', 'games', or 'active'

  useEffect(() => {
    if (stage === 'games' || stage === 'active') {
      fetchGames();
    }
  }, [stage]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${SERVER}api/games/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGames(data.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching games:', err);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStage('games');
    }
  };

  const renderNameInput = () => (
    <form onSubmit={handleNameSubmit} className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Bienvenido al juego</h1>
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Ingresa tu nombre"
        className="p-2 border rounded mb-4"
        required
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Continuar
      </button>
    </form>
  );

  const renderGamesList = () => (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-bold mb-4">Juegos Disponibles</h2>
      <ul className="w-full max-w-md">
        {games.map((game) => (
          <li key={game.id} className="p-4 border-b flex justify-between items-center">
            <span>{game.name}</span>
            <button
              onClick={() => setStage('active')}
              className="bg-green-500 text-white p-2 rounded"
            >
              Jugar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderActiveGames = () => (
    <main className="flex min-h-screen flex-col p-6">
      <h2 className="text-xl font-bold mb-4">Juegos Activos</h2>
      {error && <p className="text-red-500">Error: {error}</p>}
      {!error && games.length > 0 ? (
        <ul>
          {games.map((game) => (
            <li key={game.id} className="p-4 border-b">
              <h3 className="text-lg font-semibold">{game.name}</h3>
              <p>ID: {game.id}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No se encontraron juegos activos.</p>
      )}
      <button
        onClick={() => setStage('games')}
        className="mt-4 bg-blue-500 text-white p-2 rounded"
      >
        Volver a la lista de juegos
      </button>
    </main>
  );

  return (
    <div className="container mx-auto p-4">
      {stage === 'name' && renderNameInput()}
      {stage === 'games' && renderGamesList()}
      {stage === 'active' && renderActiveGames()}
    </div>
  );
}