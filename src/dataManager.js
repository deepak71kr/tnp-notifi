// src/dataManager.js
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

function readData(filename) {
  const filePath = path.join(dataDir, `${filename}.json`);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  }
  return [];
}

function writeData(filename, data) {
  const filePath = path.join(dataDir, `${filename}.json`);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };