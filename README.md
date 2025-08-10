# unu-training

Локальное приложение для тренировки выполнения заданий.

## Запуск локально
1. Установите Node.js 18+
2. Установите зависимости: `npm install`
3. Запустите сервер: `npm start`

## Сборка EXE через pkg
```bash
npm install -g pkg
pkg . --targets node18-win-x64 --output unu-training.exe
```
