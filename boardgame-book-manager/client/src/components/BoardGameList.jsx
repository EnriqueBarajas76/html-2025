import React from 'react';

// App.jsx now passes onDeleteGame which is already token-aware.
// We just need userRole for conditional rendering of buttons.
function BoardGameList({ boardGames, onDeleteGame, userRole }) {

  const handleDelete = (gameId) => {
    // Confirmation can stay here, or be moved to App.jsx's handler
    if (window.confirm(`Are you sure you want to delete board game ID: ${gameId}?`)) {
      onDeleteGame(gameId); // This calls the token-aware function from App.jsx
    }
  };

  if (!boardGames || boardGames.length === 0) {
    return <p>No board games available. Add one!</p>;
  }

  return (
    <div className="board-game-list">
      <h2>Board Games</h2>
      <ul>
        {boardGames.map(game => (
          <li key={game.id}>
            <h3>{game.title}</h3>
            <p>Designer: {game.designer}</p>
            <p>Genre: {game.genre}</p>
            {/* Conditionally render Delete and Edit buttons based on user role */}
            {userRole === 'admin' && (
              <>
                <button onClick={() => handleDelete(game.id)}>Delete</button>
                {/* Optional: Edit button - implement edit functionality later */}
                <button onClick={() => console.log('Edit game ID (admin):', game.id)}>Edit</button>
              </>
            )}
             {/* Example: if users can edit their own items, or a different role has edit permissions */}
             {/* {userRole === 'user' && ( Some other edit logic )} */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardGameList;
