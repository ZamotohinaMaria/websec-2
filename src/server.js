const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 8080;

var corsOptions = {
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "optionsSuccessStatus": 200
}

app.use(cors());

app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
    next();
});

app.get("/api/stations", cors(corsOptions), async (req, res) => {
    try {
        const requestUrl = new URLSearchParams(req.query);
        const response = await fetch(`https://api.rasp.yandex.net/v3.0/stations_list/?` + requestUrl.toString());
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Ошибка запроса к API:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/api/schedule", cors(corsOptions), async (req, res) => {
    try {
        const requestUrl = new URLSearchParams(req.query);
        const response = await fetch(`https://api.rasp.yandex.net/v3.0/schedule/?` + requestUrl.toString());
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Ошибка запроса к API:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.get("/api/search", cors(corsOptions), async (req, res) => {
    try {
        const requestUrl = new URLSearchParams(req.query);
        const response = await fetch(`https://api.rasp.yandex.net/v3.0/search/?` + requestUrl.toString());
        const data = await response.json();
        return res.json(data);
    } catch (error) {
        console.error("Ошибка запроса к API:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер работает: http://localhost:${PORT}`);
});