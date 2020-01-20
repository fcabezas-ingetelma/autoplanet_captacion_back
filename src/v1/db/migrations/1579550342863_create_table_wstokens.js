module.exports = {
    "up": "CREATE TABLE wstokens (" + 
            "telefono INT NOT NULL, " + 
            "token VARCHAR(255) NOT NULL, " + 
            "expiration DATETIME NOT NULL, " +
            "validated TINYINT NOT NULL, " +
            "PRIMARY KEY (telefono))",
    "down": "DROP TABLE wstokens"
}