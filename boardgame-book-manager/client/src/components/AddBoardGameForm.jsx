import React, { useState } from 'react';

// This component now relies on the onGameAdded prop (which is handleGameAdded in App.jsx)
// to perform the actual API call.
function AddBoardGameForm({ onGameAdded }) {
  const [title, setTitle] = useState('');
  const [designer, setDesigner] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!title || !designer || !genre) {
      setError('All fields are required.');
      return;
    }

    const newGame = { title, designer, genre };

    // onGameAdded is expected to be an async function that returns true on success
    const success = await onGameAdded(newGame); 

    if (success) {
      setSuccessMessage('Board game added successfully!');
      setTitle('');
      setDesigner('');
      setGenre('');
    } else {
      // Error message is now handled by App.jsx's appError or authError state
      // setError('Failed to add board game. Please check application errors.');
      // We can keep a local error for form-specific issues if needed, or rely on App.jsx
    }
  };

  return (
    <div className="add-board-game-form">
      <h3>Add New Board Game</h3> {/* Changed from h2 to h3 for better hierarchy if inside a section */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="designer">Designer:</label>
          <input
            type="text"
            id="designer"
            value={designer}
            onChange={(e) => setDesigner(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="genre">Genre:</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Game</button>
      </form>
    </div>
  );
}

export default AddBoardGameForm;
