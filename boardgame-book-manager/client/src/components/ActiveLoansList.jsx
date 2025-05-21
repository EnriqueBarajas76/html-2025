import React from 'react';

// This component relies on onLoanAction (handleLoanOrReturn in App.jsx)
// for the API call, which is already token-aware.
function ActiveLoansList({ activeLoans, onLoanAction }) {

  const handleReturn = async (loanId) => {
    if (!window.confirm(`Are you sure you want to return loan ID: ${loanId}?`)) {
      return;
    }
    // onLoanAction is expected to be an async function that returns true on success.
    // It's configured in App.jsx to call the correct backend endpoint for returning.
    const success = await onLoanAction('return', `http://localhost:3001/api/loans/return`, { loanId });

    if (success) {
      alert(`Loan ID: ${loanId} marked as returned successfully.`); // Simple feedback
      // The list will be refreshed by App.jsx's handleLoanOrReturn -> fetchActiveLoans/fetchAllLoans
    } else {
      // Error is handled and displayed by App.jsx
      // alert(`Error returning item. Check application errors.`);
    }
  };

  if (!activeLoans || activeLoans.length === 0) {
    return <p>No items are currently on loan.</p>;
  }

  return (
    <div className="active-loans-list">
      <h3>Active Loans</h3> {/* Changed from h2 to h3 */}
      <ul>
        {activeLoans.map(loan => (
          <li key={loan.id}>
            <p><strong>Loan ID:</strong> {loan.id}</p>
            <p><strong>Item ID:</strong> {loan.itemId} (Type: {loan.itemType})</p>
            <p><strong>Borrower:</strong> {loan.borrowerName}</p>
            {/* Display who loaned it if available - assuming loan.loanedByUserId might be populated */}
            {loan.loanedByUsername && <p><strong>Loaned By:</strong> {loan.loanedByUsername}</p>}
            <p><strong>Loan Date:</strong> {new Date(loan.loanDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(loan.dueDate).toLocaleDateString()}</p>
            <button onClick={() => handleReturn(loan.id)}>Return Item</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActiveLoansList;
