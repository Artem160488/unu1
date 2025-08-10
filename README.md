
UNU Electron Demo (Chrome chooser)
=================================

Description
-----------
This Electron demo shows a file dialog on first run to choose Chrome/Chromium executable, saves it to per-user config, and uses puppeteer-core to run demo tasks defined in tasks.json.

Local testing
-------------
1. Install Node.js and npm.
2. npm ci
3. npm start
4. If Chrome is not in a default location, choose it via dialog.

Building via GitHub Actions
---------------------------
Push to a GitHub repo (branch main). The workflow will run electron-builder and upload `dist/` as an artifact.

Running the built EXE
---------------------
- Ensure Chrome is installed on the target Windows machine.
- Run the EXE. On first run, choose Chrome when prompted.

Notes
-----
- This is a demo. Do not use it to automate actions on third-party sites against their terms of service.
