import { useEffect, useState } from 'react';
import axios from 'axios';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;
    const loadExpenses = async () => {
      try {
        const { data } = await axios.get('/api/expenses');
        if (isActive) {
          setExpenses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isActive) {
          setError('Failed to load expenses.');
        }
      }
    };

    loadExpenses();
    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setError('');

    const trimmedTitle = title.trim();
    const numericAmount = Number(amount);

    if (!trimmedTitle || !date || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please provide a title, a valid amount, and a date.');
      return;
    }

    try {
      const { data } = await axios.post('/api/expenses', {
        title: trimmedTitle,
        amount: numericAmount,
        date,
      });

      setExpenses((prev) => [...prev, data]);
      setTitle('');
      setAmount('');
      setDate('');
      setStatus('Expense added successfully.');
    } catch (err) {
      setError('Failed to add expense.');
    }
  };

  return (
    <div className="Expenses">
      <h1>Expenses</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="expense-title">Title</label>
          <input
            id="expense-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Groceries"
          />
        </div>

        <div>
          <label htmlFor="expense-amount">Amount</label>
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label htmlFor="expense-date">Date</label>
          <input
            id="expense-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>

        <button type="submit">Add Expense</button>
      </form>

      {status ? <p>{status}</p> : null}
      {error ? <p>{error}</p> : null}

      <ul>
        {expenses.map((expense) => (
          <li key={expense.id}>
            <strong>{expense.title}</strong> - ${expense.amount} on {expense.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Expenses;
