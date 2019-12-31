module.exports = {
    "up": "CREATE TABLE tracker (" + 
            "id INT AUTO_INCREMENT, " + 
            "rut INT, " +
            "IP VARCHAR(255), " +
            "canal INT, " + 
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE tracker"
}