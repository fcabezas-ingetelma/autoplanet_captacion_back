module.exports = {
    "up": "ALTER TABLE captadores ADD (admin_type_id INT DEFAULT 1)",
    "down": "ALTER TABLE captadores DROP COLUMN admin_type_id"
}