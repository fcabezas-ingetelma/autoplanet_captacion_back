module.exports = {
    "up": "ALTER TABLE tracker ADD canal_promotor INT",
    "down": "ALTER TABLE tracker DROP COLUMN canal_promotor"
}