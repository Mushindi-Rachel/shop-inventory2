const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const next = require('next');
const http = require('http');

let mainWindow;
const PORT = 3000;

// Point the DB and uploads at a writable, persistent folder
const userDataDir = app.getPath('userData');
const dataDir = path.join(userDataDir, 'data');
const uploadsDir = path.join(userDataDir, 'uploads');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

process.env.DB_PATH = path.join(dataDir, 'shop.db');
process.env.UPLOADS_PATH = uploadsDir;

async function startNextServer() {
    const nextApp = next({ dev: false, dir: path.join(__dirname, '..') });
    const handle = nextApp.getRequestHandler();
    await nextApp.prepare();
    const server = http.createServer((req, res) => handle(req, res));
    server.listen(PORT);


    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
        icon: path.join(__dirname, "icon.ico"),
    });
}

async function createWindow() {
    await startNextServer();
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        autoHideMenuBar: true,
    });
    mainWindow.loadURL(`http://localhost:${PORT}`);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());