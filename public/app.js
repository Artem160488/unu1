async function startTasks() {
    await fetch('/start');
    updateStatus();
}

async function stopTasks() {
    await fetch('/stop');
    updateStatus();
}

async function updateStatus() {
    const res = await fetch('/status');
    const data = await res.json();
    document.getElementById('status').innerText = 
        data.running ? `Выполняется задание ${data.current} из ${data.total}` : 'Остановлено';
}

setInterval(updateStatus, 1000);
