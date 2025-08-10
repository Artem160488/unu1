const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Загружаем задания
let tasks = JSON.parse(fs.readFileSync(path.join(__dirname, 'tasks.json'), 'utf-8'));
let currentIndex = 0;
let isRunning = false;
let interval = null;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/start', (req, res) => {
    if (!isRunning) {
        isRunning = true;
        currentIndex = 0;
        runTasks();
        res.json({ status: 'started' });
    } else {
        res.json({ status: 'already running' });
    }
});

app.get('/stop', (req, res) => {
    isRunning = false;
    clearInterval(interval);
    res.json({ status: 'stopped' });
});

app.get('/status', (req, res) => {
    res.json({ running: isRunning, current: currentIndex, total: tasks.length });
});

function runTasks() {
    interval = setInterval(() => {
        if (!isRunning) {
            clearInterval(interval);
            return;
        }
        if (currentIndex < tasks.length) {
            console.log(`Выполняем задание: ${tasks[currentIndex].title}`);
            currentIndex++;
        } else {
            isRunning = false;
            clearInterval(interval);
            console.log('Все задания выполнены!');
        }
    }, Math.floor(Math.random() * (6000 - 2000 + 1)) + 2000); // задержка 2-6 сек
}

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
