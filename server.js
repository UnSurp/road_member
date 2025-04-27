const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const DATA_FILE = path.join(__dirname, "data.json");

// Увеличиваем лимит для JSON-запросов (base64-изображения могут быть большими)
app.use(express.json({ limit: "10mb" }));
app.use(express.static(__dirname));

// Функция для чтения данных из data.json
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Ошибка чтения JSON:", error);
    return [];
  }
}

// Функция для записи данных в data.json
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// Маршрут для получения всех карточек
app.get("/data", (req, res) => {
  const data = readData();
  res.json(data);
});

// Маршрут для добавления нового блока
app.post("/add", (req, res) => {
  const newBlock = req.body;
  if (
    !newBlock ||
    !newBlock.image ||
    !newBlock.title ||
    !newBlock.description ||
    !newBlock.extra
  ) {
    return res.status(400).json({ success: false, error: "Неполные данные блока" });
  }
  const data = readData();
  data.push(newBlock);
  writeData(data);
  res.json({ success: true });
});

// Маршрут для обновления массива карточек (при редактировании или удалении)
app.post("/update", (req, res) => {
  const updatedBlocks = req.body;
  if (!Array.isArray(updatedBlocks)) {
    return res.status(400).json({ success: false, error: "Некорректные данные" });
  }
  writeData(updatedBlocks);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
