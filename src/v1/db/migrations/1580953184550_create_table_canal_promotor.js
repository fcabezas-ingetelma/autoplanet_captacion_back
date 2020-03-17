module.exports = {
    "up": "CREATE TABLE canal_promotor (" + 
            "id INT NOT NULL, " + 
            "nombre VARCHAR(255), " + 
            "created_at DATETIME, " + 
            "updated_at DATETIME, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE canal_promotor"
}