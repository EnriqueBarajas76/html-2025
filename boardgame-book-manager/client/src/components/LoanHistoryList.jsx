import React, { useState, useEffect } from 'react';

// This component relies on onLoanAction (handleLoanOrReturn in App.jsx)
// for any API calls (like returning an item), which is already token-aware.
function LoanHistoryList({ allLoans: initialLoans, onLoanAction }) {
  const [loans, setLoans] = useState(initialLoans || []); // Ensure initialLoans is not null/undefined
  const [filterBorrower, setFilterBorrower] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // 'all', 'loaned', 'returned'

  // Update local state if the prop changes (e.g., after a new loan or return)
  useEffect(() => {
    setLoans(initialLoans || []); // Ensure prop updates are reflected
  }, [initialLoans]);


  const handleReturn = async (loanId) => {
    if (!window.confirm(`Are you sure you want to mark loan ID: ${loanId} as returned from history? This action is for already active loans shown here.`)) {
        return;
    }
    // onLoanAction is expected to be an async function that returns true on success.
    // It's configured in App.jsx to call the correct backend endpoint for returning.
    const success = await onLoanAction('return', `http://localhost:3001/api/loans/return`, { loanId });

    if (success) {
      alert(`Loan ID: ${loanId} marked as returned successfully.`);
      // The list will be refreshed by App.jsx's handleLoanOrReturn -> fetchAllLoans
    } else {
      // Error is handled and displayed by App.jsx
      // alert(`Error returning item. Check application errors.`);
    }
  };

  const filteredLoans = loans.filter(loan => {
    const borrowerMatch = filterBorrower ? loan.borrowerName.toLowerCase().includes(filterBorrower.toLowerCase()) : true;
    const statusMatch = filterStatus ? 
                        (filterStatus === 'loaned' ? loan.returnDate === null : loan.returnDate !== null) 
                        : true;
    return borrowerMatch && statusMatch;
  });

  if (!loans || loans.length === 0) {
    return <p>No loan history available.</p>;
  }

  return (
    <div className="loan-history-list">
      <h3>Loan History</h3> {/* Changed from h2 to h3 */}
      <div className="filters" style={{ marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Filter by borrower..." 
          value={filterBorrower} 
          onChange={e => setFilterBorrower(e.target.value)} 
          style={{ marginRight: '10px' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="loaned">Loaned</option>
          <option value="returned">Returned</option>
        </select>
      </div>
      {filteredLoans.length === 0 && <p>No loans match the current filters.</p>}
      <ul>
        {filteredLoans.map(loan => (
          <li key={loan.id} style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px' }}>
            <p><strong>Loan ID:</strong> {loan.id}</p>
            <p><strong>Item ID:</strong> {loan.itemId} (Type: {loan.itemType})</p>
            <p><strong>Borrower:</strong> {loan.borrowerName}</p>
            {/* Display who loaned/returned it if available - assuming these fields might be populated */}
            {loan.loanedByUsername && <p><strong>Loaned By:</strong> {loan.loanedByUsername}</p>}
            {loan.returnedByUsername && loan.returnDate && <p><strong>Returned By:</strong> {loan.returnedByUsername}</p>}
            <p><strong>Loan Date:</strong> {new Date(loan.loanDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(loan.dueDate).toLocaleDateString()}</p>
            <p>
              <strong>Status:</strong> {loan.returnDate ? 
                `Returned on ${new Date(loan.returnDate).toLocaleDateString()}` : 
                'Currently Loaned'}
            </p>
            {loan.returnDate === null && ( // Only show return button if item is currently loaned
                 <button onClick={() => handleReturn(loan.id)}>Mark as Returned</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LoanHistoryList;
