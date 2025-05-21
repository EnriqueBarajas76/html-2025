import React, { useState } from 'react';

// This component now relies on the onLoanAction prop (handleLoanOrReturn in App.jsx)
// to perform the actual API call.
function LoanItemForm({ onLoanAction }) {
  const [itemId, setItemId] = useState('');
  const [itemType, setItemType] = useState('boardgame'); // Default to boardgame
  const [borrowerName, setBorrowerName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!itemId || !itemType || !borrowerName || !dueDate) {
      setError('All fields are required.');
      return;
    }

    const loanDetails = {
      itemId: parseInt(itemId),
      itemType,
      borrowerName,
      dueDate,
    };

    // onLoanAction is expected to be an async function that returns true on success
    // It's already configured in App.jsx to call the correct backend endpoint for borrowing.
    const success = await onLoanAction('borrow', 'http://localhost:3001/api/loans/borrow', loanDetails);

    if (success) {
      setSuccessMessage(`Item '${itemType} ID: ${itemId}' loan initiated for ${borrowerName}.`);
      setItemId('');
      // setItemType('boardgame'); // Keep last used or reset
      setBorrowerName('');
      setDueDate('');
    } else {
      // Error message is now handled by App.jsx's appError or authError state
      // setError('Failed to borrow item. Please check application errors.');
    }
  };

  return (
    <div className="loan-item-form">
      <h3>Borrow Item</h3> {/* Changed from h2 to h3 */}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loan-itemId">Item ID:</label>
          <input
            type="number"
            id="loan-itemId"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="loan-itemType">Item Type:</label>
          <select
            id="loan-itemType"
            value={itemType}
            onChange={(e) => setItemType(e.target.value)}
            required
          >
            <option value="boardgame">Board Game</option>
            <option value="book">Book</option>
          </select>
        </div>
        <div>
          <label htmlFor="loan-borrowerName">Borrower Name:</label>
          <input
            type="text"
            id="loan-borrowerName"
            value={borrowerName}
            onChange={(e) => setBorrowerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="loan-dueDate">Due Date:</label>
          <input
            type="date"
            id="loan-dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <button type="submit">Borrow Item</button>
      </form>
    </div>
  );
}

export default LoanItemForm;
