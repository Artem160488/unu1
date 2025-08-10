
const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer-core');
const open = require('open');

const CONFIG = path.join(app.getPath('userData'), 'config.json');
const TASKS_FILE = path.join(__dirname, '..', 'tasks.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG)) return JSON.parse(fs.readFileSync(CONFIG, 'utf-8'));
  } catch(e){}
  return {};
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG, JSON.stringify(cfg, null, 2));
}

async function askForChrome(win) {
  const res = await dialog.showOpenDialog(win, {
    title: 'Выберите chrome.exe или исполняемый файл Chromium',
    properties: ['openFile'],
    filters: [{ name: 'Executables', extensions: ['exe','app',''] }]
  });
  if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
  return res.filePaths[0];
}

async function ensureChrome(win) {
  let cfg = loadConfig();
  if (cfg.chromePath && fs.existsSync(cfg.chromePath)) return cfg.chromePath;
  const choice = await askForChrome(win);
  if (!choice) return null;
  cfg.chromePath = choice;
  saveConfig(cfg);
  return choice;
}

function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function delay(ms){ return new Promise(res=>setTimeout(res, ms)); }

async function runPuppeteerTasks(win) {
  let cfg = loadConfig();
  if (!cfg.chromePath || !fs.existsSync(cfg.chromePath)) {
    win.webContents.send('log', 'Не найден Chrome. Пожалуйста, укажите путь.');
    return;
  }
  win.webContents.send('log', `Используется Chrome: ${cfg.chromePath}`);

  const tasks = JSON.parse(fs.readFileSync(TASKS_FILE,'utf-8'));
  const browser = await puppeteer.launch({
    executablePath: cfg.chromePath,
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  const page = await browser.newPage();
  page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) DemoBot/1.0');

  for (let i=0;i<tasks.length;i++) {
    const t = tasks[i];
    win.webContents.send('log', `Task ${i+1}/${tasks.length}: ${t.action} ${t.selector||''} ${t.url||''}`);
    try {
      if (t.url) {
        await page.goto(t.url, { waitUntil: 'domcontentloaded' }).catch(()=>{});
        await page.waitForTimeout(randInt(500,1500));
      }

      if (t.action === 'click') {
        if (!t.selector) { win.webContents.send('log','Missing selector'); continue; }
        await page.waitForSelector(t.selector, { timeout: 7000 });
        const el = await page.$(t.selector);
        if (!el) { win.webContents.send('log', 'Element not found: '+t.selector); continue; }
        const box = await el.boundingBox();
        if (!box) { win.webContents.send('log', 'No bounding box for '+t.selector); continue; }
        const steps = randInt(8,18);
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2, { steps });
        await page.waitForTimeout(randInt(300,900));
        await el.click({ delay: randInt(40,120) });
        win.webContents.send('log', 'Clicked '+t.selector);
      } else if (t.action === 'type') {
        if (!t.selector) { win.webContents.send('log','Missing selector'); continue; }
        await page.waitForSelector(t.selector, { timeout: 7000 });
        const el = await page.$(t.selector);
        if (!el) { win.webContents.send('log', 'Element not found: '+t.selector); continue; }
        await el.click();
        await page.waitForTimeout(randInt(200,600));
        const val = t.value || '';
        for (const ch of val.split('')) {
          await page.keyboard.type(ch, { delay: randInt(60,160) });
        }
        win.webContents.send('log', 'Typed into '+t.selector);
      } else if (t.action === 'scroll') {
        const amount = t.value || randInt(200,800);
        await page.evaluate(y=>window.scrollBy(0,y), amount);
        win.webContents.send('log', 'Scrolled by '+amount);
      } else if (t.action === 'wait') {
        const sec = t.value || 2;
        win.webContents.send('log', 'Waiting '+sec+'s');
        await page.waitForTimeout(sec*1000);
      } else {
        win.webContents.send('log', 'Unknown action: '+t.action);
      }

      await page.waitForTimeout(randInt(800,2200));
    } catch (e) {
      win.webContents.send('log', 'Task error: '+(e.message||e));
    }
  }

  win.webContents.send('log', 'All tasks done — closing browser in 2s');
  await page.waitForTimeout(2000);
  await browser.close();
  win.webContents.send('log', 'Browser closed');
}

function createWindow () {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  ipcMain.handle('choose-chrome', async () => {
    const p = await askForChrome(win);
    if (p) {
      const cfg = loadConfig();
      cfg.chromePath = p;
      saveConfig(cfg);
    }
    return p;
  });

  ipcMain.handle('run-tasks', async () => {
    await runPuppeteerTasks(win);
    return true;
  });

  ipcMain.handle('get-config', async () => {
    return loadConfig();
  });

  return win;
}

app.whenReady().then(()=>{
  const win = createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
