module.exports = {
    "up": "CREATE TABLE tracker (" + 
            "id INT NOT NULL AUTO_INCREMENT, " + 
            "rut_captador INT, " +
            "rut_cliente INT, " +
            "IP VARCHAR(255), " +
            "canal INT, " + 
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE tracker"
}