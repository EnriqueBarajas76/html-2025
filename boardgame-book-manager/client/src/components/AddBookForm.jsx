import React, { useState } from 'react';

// This component now relies on the onBookAdded prop (which is handleBookAdded in App.jsx)
// to perform the actual API call.
function AddBookForm({ onBookAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!title || !author || !genre) {
      setError('All fields are required.');
      return;
    }

    const newBook = { title, author, genre };

    // onBookAdded is expected to be an async function that returns true on success
    const success = await onBookAdded(newBook);

    if (success) {
      setSuccessMessage('Book added successfully!');
      setTitle('');
      setAuthor('');
      setGenre('');
    } else {
      // Error message is now handled by App.jsx's appError or authError state
      // setError('Failed to add book. Please check application errors.');
    }
  };

  return (
    <div className="add-book-form">
      <h3>Add New Book</h3> {/* Changed from h2 to h3 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="book-title">Title:</label>
          <input
            type="text"
            id="book-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="author">Author:</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="book-genre">Genre:</label>
          <input
            type="text"
            id="book-genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Book</button>
      </form>
    </div>
  );
}

export default AddBookForm;
