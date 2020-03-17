module.exports = {
    "up": "ALTER TABLE captadores ADD CONSTRAINT fk_admin_type_id FOREIGN KEY (admin_type_id) REFERENCES admin_types(id)",
    "down": "ALTER TABLE captadores DROP COLUMN admin_type_id"
}