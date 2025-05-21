import React from 'react';

// App.jsx now passes onDeleteBook which is already token-aware.
// We just need userRole for conditional rendering of buttons.
function BookList({ books, onDeleteBook, userRole }) {

  const handleDelete = (bookId) => {
    // Confirmation can stay here
    if (window.confirm(`Are you sure you want to delete book ID: ${bookId}?`)) {
      onDeleteBook(bookId); // This calls the token-aware function from App.jsx
    }
  };

  if (!books || books.length === 0) {
    return <p>No books available. Add one!</p>;
  }

  return (
    <div className="book-list">
      <h2>Books</h2>
      <ul>
        {books.map(book => (
          <li key={book.id}>
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            <p>Genre: {book.genre}</p>
            {/* Conditionally render Delete and Edit buttons based on user role */}
            {userRole === 'admin' && (
              <>
                <button onClick={() => handleDelete(book.id)}>Delete</button>
                {/* Optional: Edit button - implement edit functionality later */}
                <button onClick={() => console.log('Edit book ID (admin):', book.id)}>Edit</button>
              </>
            )}
            {/* Example for other roles or user-specific actions can be added here if needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BookList;
