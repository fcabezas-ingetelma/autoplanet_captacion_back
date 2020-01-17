module.exports = {
    "up": "CREATE TABLE tracker (" + 
            "id INT NOT NULL AUTO_INCREMENT, " + 
            "rut_captador INT, " +
            "rut_cliente INT, " +
            "IP VARCHAR(255), " +
            "canal INT, " + 
            "sku INT, " + 
            "user_agent VARCHAR(255), " + 
            "os VARCHAR(255), " + 
            "created_at DATETIME, " + 
            "updated_at DATETIME, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE tracker"
}