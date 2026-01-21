import dictionary from './languages.js';

const BASE_URL = "http://localhost:8080/discopanel.v1.ServerService";
const POLLING_INTERVAL = 5000;

let currentLanguage = 'en';
let serverStatus = "SERVER_STATUS_STOPPED";
let serverId = "";

const elements = {
    title: document.querySelector('title'),
    heading: document.querySelector('[data-i18n="title"]'),
    ipLabel: document.querySelector('[data-i18n="ipLabel"]'),
    ipInput: document.getElementById('ipField'),
    copyButton: document.getElementById('copyBtn'),
    statusIcon: document.getElementById('statusIcon'),
    statusText: document.getElementById('statusText'),
    playerSection: document.getElementById('playerSection'),
    playerCount: document.getElementById('playerCount'),
    startButton: document.getElementById('btnStart'),
    restartButton: document.getElementById('btnRestart'),
    stopButton: document.getElementById('btnStop'),
    languageSelect: document.getElementById('languageSelect'),
    modpackLink: document.querySelector('.side-modpack')
};

async function loadConfig() {
    try {
        const response = await fetch('./config.json');
        const config = await response.json();

        if (config.IP && config.PORT) {
            elements.ipInput.value = `${config.IP}:${config.PORT}`;
        } else if (config.IP) {
            elements.ipInput.value = config.IP;
        }

        if (config.MODPACK_URL && elements.modpackLink) {
            elements.modpackLink.href = config.MODPACK_URL;
        }

        if (config.SERVER_ID && config.SERVER_ID.trim() !== "") {
            serverId = config.SERVER_ID;
        }
    } catch (error) {
        console.error("Failed to load config.json:", error);
    }
}

async function fetchServerStatus() {
    if (!serverId) {
        try {
            const response = await fetch(`${BASE_URL}/ListServers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Connect-Protocol-Version': '1' },
                body: JSON.stringify({ fullStats: false })
            });
            const listData = await response.json();
            if (listData.servers?.length > 0) serverId = listData.servers[0].id;
            else return;
        } catch {
            return;
        }
    }

    try {
        const response = await fetch(`${BASE_URL}/GetServer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Connect-Protocol-Version': '1' },
            body: JSON.stringify({ id: serverId })
        });
        const data = await response.json();

        if (data.server) {
            serverStatus = data.server.status;
            updateStatusUI();
            updatePlayerUI(data.server.playersOnline, data.server.maxPlayers);
        }
    } catch (error) {
        console.error("Failed to fetch server status:", error);
    }
}

function updateStatusUI() {
    const texts = dictionary[currentLanguage];
    elements.statusIcon.className = 'status-dot';

    const statusMapping = {
        SERVER_STATUS_RUNNING: { className: 'online', label: texts.running },
        SERVER_STATUS_STOPPED: { className: 'offline', label: texts.stopped },
        SERVER_STATUS_STARTING: { className: 'warning', label: texts.starting },
        SERVER_STATUS_STOPPING: { className: 'warning', label: texts.stopping },
        SERVER_STATUS_RESTARTING: { className: 'warning', label: texts.restarting },
        SERVER_STATUS_CREATING: { className: 'warning', label: texts.creating },
        SERVER_STATUS_ERROR: { className: 'danger', label: texts.error },
        SERVER_STATUS_UNHEALTHY: { className: 'danger', label: texts.unhealthy },
        SERVER_STATUS_UNSPECIFIED: { className: 'offline', label: texts.unspecified }
    };

    const current = statusMapping[serverStatus] || statusMapping.SERVER_STATUS_UNSPECIFIED;
    elements.statusIcon.classList.add(current.className);
    elements.statusText.innerText = current.label;

    const isTransitioning = ["SERVER_STATUS_STARTING", "SERVER_STATUS_STOPPING", "SERVER_STATUS_RESTARTING"].includes(serverStatus);

    if (["SERVER_STATUS_RUNNING", "SERVER_STATUS_UNHEALTHY"].includes(serverStatus)) {
        elements.startButton.classList.add('hidden');
        elements.restartButton.classList.remove('hidden');
        elements.stopButton.classList.remove('hidden');
    } else {
        elements.startButton.classList.remove('hidden');
        elements.restartButton.classList.add('hidden');
        elements.stopButton.classList.add('hidden');
    }

    [elements.startButton, elements.restartButton, elements.stopButton].forEach(btn => {
        btn.disabled = isTransitioning;
        btn.style.opacity = isTransitioning ? "0.5" : "1";
    });
}

function updatePlayerUI(online, max) {
    if (serverStatus === "SERVER_STATUS_RUNNING") {
        elements.playerSection.style.display = "flex";
        elements.playerCount.innerText = `${online || 0}/${max || 0}`;
    } else {
        elements.playerSection.style.display = "none";
    }
}

function updateLanguage(lang) {
    currentLanguage = lang;
    const texts = dictionary[lang];
    if (!texts) return;

    elements.title.innerText = texts.title;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            const span = el.querySelector('span');
            if (span) span.innerText = texts[key];
            else el.innerText = texts[key];
        }
    });

    updateStatusUI();
}

async function handleAction(actionName) {
    if (!serverId) return;

    const methodName = `${actionName.charAt(0).toUpperCase() + actionName.slice(1)}Server`;
    const button = document.getElementById(`btn${actionName.charAt(0).toUpperCase() + actionName.slice(1)}`);
    button.disabled = true;

    try {
        await fetch(`${BASE_URL}/${methodName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Connect-Protocol-Version': '1' },
            body: JSON.stringify({ id: serverId })
        });
        setTimeout(fetchServerStatus, 1000);
    } catch {
        alert("Operation failed");
    } finally {
        button.disabled = false;
    }
}

elements.languageSelect.addEventListener('change', e => {
    localStorage.setItem('lang', e.target.value);
    updateLanguage(e.target.value);
});

elements.copyButton.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.ipInput.value).then(() => {
        elements.copyButton.classList.add('copied');
        setTimeout(() => elements.copyButton.classList.remove('copied'), 2000);
    });
});

elements.startButton.addEventListener('click', () => handleAction('start'));
elements.restartButton.addEventListener('click', () => handleAction('restart'));
elements.stopButton.addEventListener('click', () => handleAction('stop'));

async function init() {
    const savedLanguage = localStorage.getItem('lang') || 'en';
    elements.languageSelect.value = savedLanguage;
    updateLanguage(savedLanguage);
    await loadConfig();
    fetchServerStatus();
    setInterval(fetchServerStatus, POLLING_INTERVAL);
}

init();
