import React, { useState, useEffect, useCallback, useContext } from 'react';
import './App.css';
import AuthContext from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import RegistrationForm from './components/RegistrationForm';
import BoardGameList from './components/BoardGameList';
import AddBoardGameForm from './components/AddBoardGameForm';
import BookList from './components/BookList';
import AddBookForm from './components/AddBookForm';
import LoanItemForm from './components/LoanItemForm';
import ActiveLoansList from './components/ActiveLoansList';
import LoanHistoryList from './components/LoanHistoryList';

// Helper for API calls
const apiFetch = async (url, options = {}, token) => {
  const headers = { ...options.headers, 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });
  if (response.status === 204) return null; // Handle No Content

  const data = await response.json().catch(() => {
    // If response is not JSON, or empty, but still an error status
    if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
    return null; // Or some other default for non-JSON success, though typically API should be consistent
  });
  
  if (!response.ok) {
    throw new Error(data ? data.message : `API Error: ${response.status} ${response.statusText}`);
  }
  return data;
};


function App() {
  const { token, user, isAuthenticated, loading, logout, authError, setAuthError } = useContext(AuthContext);

  const [boardGames, setBoardGames] = useState([]);
  const [books, setBooks] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [appError, setAppError] = useState(null); // For general app errors (e.g., failed fetches)

  // --- Board Games ---
  const fetchBoardGames = useCallback(async () => {
    setAppError(null);
    try {
      const data = await apiFetch('http://localhost:3001/api/boardgames', {}, token);
      setBoardGames(data || []);
    } catch (err) {
      console.error('Error fetching board games:', err);
      setAppError(err.message);
    }
  }, [token]); // Add token as dependency

  const handleGameAdded = async (gameData) => {
    setAppError(null);
    try {
      await apiFetch('http://localhost:3001/api/boardgames', { method: 'POST', body: JSON.stringify(gameData) }, token);
      fetchBoardGames(); // Re-fetch
      return true; // Indicate success
    } catch (err) {
      console.error('Error adding board game:', err);
      setAppError(err.message);
      return false; // Indicate failure
    }
  };

  const handleGameDeleted = async (gameId) => {
    setAppError(null);
    try {
      await apiFetch(`http://localhost:3001/api/boardgames/${gameId}`, { method: 'DELETE' }, token);
      fetchBoardGames(); // Re-fetch
    } catch (err) {
      console.error('Error deleting board game:', err);
      setAppError(err.message);
    }
  };
  
  // --- Books ---
  const fetchBooks = useCallback(async () => {
    setAppError(null);
    try {
      const data = await apiFetch('http://localhost:3001/api/books', {}, token);
      setBooks(data || []);
    } catch (err) {
      console.error('Error fetching books:', err);
      setAppError(err.message);
    }
  }, [token]);

  const handleBookAdded = async (bookData) => {
    setAppError(null);
    try {
      await apiFetch('http://localhost:3001/api/books', { method: 'POST', body: JSON.stringify(bookData) }, token);
      fetchBooks(); // Re-fetch
      return true;
    } catch (err) {
      console.error('Error adding book:', err);
      setAppError(err.message);
      return false;
    }
  };

  const handleBookDeleted = async (bookId) => {
    setAppError(null);
    try {
      await apiFetch(`http://localhost:3001/api/books/${bookId}`, { method: 'DELETE' }, token);
      fetchBooks(); // Re-fetch
    } catch (err) {
      console.error('Error deleting book:', err);
      setAppError(err.message);
    }
  };

  // --- Loans ---
  const fetchActiveLoans = useCallback(async () => {
    setAppError(null);
    if (!isAuthenticated) return; // Don't fetch if not authenticated
    try {
      const data = await apiFetch('http://localhost:3001/api/loans/active', {}, token);
      setActiveLoans(data || []);
    } catch (err) {
      console.error('Error fetching active loans:', err);
      setAppError(err.message);
    }
  }, [token, isAuthenticated]);

  const fetchAllLoans = useCallback(async () => {
    setAppError(null);
    if (!isAuthenticated) return; // Don't fetch if not authenticated
    try {
      const data = await apiFetch('http://localhost:3001/api/loans', {}, token);
      setAllLoans(data || []);
    } catch (err) {
      console.error('Error fetching all loans:', err);
      setAppError(err.message);
    }
  }, [token, isAuthenticated]);


  const handleLoanOrReturn = async (action, url, body) => {
    setAppError(null);
    setAuthError(null); // Clear auth error before trying
    try {
      await apiFetch(url, { method: 'POST', body: JSON.stringify(body) }, token);
      fetchActiveLoans();
      fetchAllLoans();
      return true;
    } catch (err) {
      console.error(`Error ${action} item:`, err);
      // If it's an auth-like error (401, 403), setAuthError, otherwise setAppError
      if (err.message.includes('401') || err.message.includes('403') || err.message.toLowerCase().includes('token')) {
        setAuthError(err.message);
      } else {
        setAppError(err.message);
      }
      return false;
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoardGames();
      fetchBooks();
      fetchActiveLoans();
      fetchAllLoans();
    } else {
      // Clear data if user logs out
      setBoardGames([]);
      setBooks([]);
      setActiveLoans([]);
      setAllLoans([]);
    }
  }, [isAuthenticated, fetchBoardGames, fetchBooks, fetchActiveLoans, fetchAllLoans]);


  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Board Game and Book Manager</h1>
        {isAuthenticated && user && (
          <div className="user-info">
            <span>Welcome, {user.username} ({user.role})!</span>
            <button onClick={logout}>Logout</button>
          </div>
        )}
      </header>
      <main>
        {authError && <p className="error-message auth-error">Authentication Error: {authError}</p>}
        {appError && <p className="error-message app-error">Application Error: {appError}</p>}

        {!isAuthenticated ? (
          <div className="auth-forms">
            <LoginForm />
            <hr />
            <RegistrationForm />
          </div>
        ) : (
          <>
            <section className="management-section board-games-section">
              <h2>Board Games Management</h2>
              {(user.role === 'admin' || user.role === 'user') && <AddBoardGameForm onGameAdded={handleGameAdded} apiFetch={apiFetch} token={token} />}
              <BoardGameList boardGames={boardGames} onDeleteGame={handleGameDeleted} userRole={user.role} apiFetch={apiFetch} token={token}/>
            </section>
            
            <hr /> 

            <section className="management-section books-section">
              <h2>Books Management</h2>
              {(user.role === 'admin' || user.role === 'user') && <AddBookForm onBookAdded={handleBookAdded} apiFetch={apiFetch} token={token}/>}
              <BookList books={books} onDeleteBook={handleBookDeleted} userRole={user.role} apiFetch={apiFetch} token={token}/>
            </section>

            <hr />

            <section className="management-section loan-management-section">
              <h2>Loan Management</h2>
              <LoanItemForm onLoanAction={handleLoanOrReturn} />
              <ActiveLoansList activeLoans={activeLoans} onLoanAction={handleLoanOrReturn} />
              <LoanHistoryList allLoans={allLoans} onLoanAction={handleLoanOrReturn} />
            </section>

            {user.role === 'admin' && (
              <>
                <hr/>
                <section className="management-section admin-test-section">
                    <h2>Admin Test Area</h2>
                    <button onClick={async () => {
                        try {
                            const data = await apiFetch('http://localhost:3001/api/admin/test', {}, token);
                            alert(data.message);
                        } catch (error) {
                            setAppError(error.message);
                        }
                    }}>Test Admin Route</button>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
