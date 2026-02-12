const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let expenses = [];

app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { title, amount, date } = req.body || {};
  const numericAmount = Number(amount);

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date is required.' });
  }
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0.' });
  }

  const newExpense = {
    id: Date.now(),
    title: title.trim(),
    amount: numericAmount,
    date,
  };

  expenses.push(newExpense);
  res.status(201).json(newExpense);
});

app.listen(PORT, () => {
  console.log(`Expenses API running on http://localhost:${PORT}`);
});
