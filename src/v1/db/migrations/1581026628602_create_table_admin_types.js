module.exports = {
    "up": "CREATE TABLE admin_types (" + 
            "id INT NOT NULL, " + 
            "type VARCHAR(255), " + 
            "created_at DATETIME, " + 
            "updated_at DATETIME, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE admin_types"
}