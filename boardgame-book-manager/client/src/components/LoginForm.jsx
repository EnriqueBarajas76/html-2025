import React, { useState, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState(''); // Local error, if needed
  const { login, authError, setAuthError } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    // setError('');
    setAuthError(null); // Clear previous global auth errors

    const success = await login(username, password);
    if (success) {
      // Login successful, AuthContext state will update, App.jsx will re-render
      // No need to set message here, UI will change based on isAuthenticated
      setUsername('');
      setPassword('');
    } else {
      // Error is set in AuthContext (authError) and will be displayed, e.g., in App.jsx
      // setError(authError || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="login-form">
      <h2>Login</h2>
      {/* Display global authError from context, or handle in App.jsx */}
      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-username">Username:</label>
          <input
            type="text"
            id="login-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="login-password">Password:</label>
          <input
            type="password"
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
