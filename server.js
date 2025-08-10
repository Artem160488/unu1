const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const open = require('open');

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Puppeteer Demo: задания выполняются автоматически, см. консоль.');
});

async function runTasks() {
    const tasksPath = path.join(__dirname, 'tasks.json');
    const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf-8'));

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    for (let task of tasks) {
        console.log(`Открываю: ${task.url}`);
        await page.goto(task.url, { waitUntil: 'domcontentloaded' });

        if (task.action === 'click') {
            try {
                await page.waitForSelector(task.selector, { timeout: 5000 });
                const element = await page.$(task.selector);

                if (element) {
                    console.log(`Кликаю по: ${task.selector}`);
                    const box = await element.boundingBox();
                    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 15 });
                    await page.waitForTimeout(500 + Math.random() * 1000);
                    await element.click();
                }
            } catch (e) {
                console.log(`Элемент не найден: ${task.selector}`);
            }
        }

        const delay = 2000 + Math.random() * 3000;
        console.log(`Жду ${delay.toFixed(0)} мс`);
        await page.waitForTimeout(delay);
    }

    console.log("Все задания выполнены!");
}

app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}`);
    open(`http://localhost:${PORT}`);
    runTasks();
});