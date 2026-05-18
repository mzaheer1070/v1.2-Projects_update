const endpoints = ["/users", "/orders", "/auth/login", "/products", "/health"];
const methods = ["GET", "GET", "POST", "GET", "GET"];
const statsGrid = document.getElementById("stats-grid");
const logList = document.getElementById("log-list");

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderStats() {
    const stats = [
        { label: "Requests / min", value: randomBetween(120, 480) },
        { label: "Success rate", value: `${randomBetween(96, 99)}.${randomBetween(0, 9)}%` },
        { label: "Avg latency", value: `${randomBetween(42, 180)} ms` },
        { label: "Active errors", value: randomBetween(0, 6) }
    ];

    statsGrid.innerHTML = stats.map((stat) => `
        <article class="stat-box">
            <span>${stat.label}</span>
            <strong>${stat.value}</strong>
        </article>
    `).join("");
}

function renderLog() {
    const rows = Array.from({ length: 6 }, () => {
        const index = randomBetween(0, endpoints.length - 1);
        const status = Math.random() > 0.12 ? 200 : 429;
        const statusClass = status === 200 ? "ok" : "warn";

        return `
            <li>
                <span class="status ${statusClass}">${status}</span>
                <span>${methods[index]} ${endpoints[index]}</span>
                <span>${randomBetween(30, 220)} ms</span>
            </li>
        `;
    });

    logList.innerHTML = rows.join("");
}

document.getElementById("refresh-log").addEventListener("click", () => {
    renderStats();
    renderLog();
});

renderStats();
renderLog();
window.setInterval(() => {
    renderStats();
}, 5000);
