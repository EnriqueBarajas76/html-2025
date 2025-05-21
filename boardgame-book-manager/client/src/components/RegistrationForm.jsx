import React, { useState, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

function RegistrationForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, setAuthError } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setAuthError(null); // Clear global auth error

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    const success = await register(username, password);
    if (success) {
      setMessage('Registration successful! You can now log in.');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } else {
      // Error is handled by AuthContext and displayed via its authError state
      // but we can set a local error too if needed, or rely on global.
      // For now, let's assume AuthContext's error display is sufficient or will be handled in App.jsx
    }
  };

  return (
    <div className="registration-form">
      <h2>Register</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* Display global auth error from context if needed, or handle in App.jsx */}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="reg-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
