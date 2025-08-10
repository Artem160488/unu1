const express = require('express');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const open = require('open');

const adapter = new FileSync('data.json');
const db = low(adapter);

// Инициализация базы с тестовыми заданиями
db.defaults({ tasks: [{ id: 1, title: 'Пример задания', status: 'pending' }] }).write();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API для получения задач
app.get('/api/v1/tasks', (req, res) => {
  res.json(db.get('tasks').value());
});

// API для обновления задачи
app.post('/api/v1/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.get('tasks').find({ id: parseInt(id) }).assign({ status }).write();
  res.json({ success: true });
});

// Health-check
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
});
