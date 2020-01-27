module.exports = {
    "up": "CREATE TABLE captadores (" + 
            "rut INT NOT NULL, " + 
            "email VARCHAR(255), " + 
            "password VARCHAR(255), " + 
            "token VARCHAR(255), " + 
            "expiration DATETIME, " +
            "PRIMARY KEY (rut))",
    "down": "DROP TABLE captadores"
}