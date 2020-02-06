module.exports = {
    "up": "ALTER TABLE clients ADD canal_promotor INT",
    "down": "ALTER TABLE clients DROP COLUMN canal_promotor"
}