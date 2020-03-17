module.exports = {
    "up": "CREATE TABLE estado_solicitud_inscripcion (" + 
            "id INT NOT NULL AUTO_INCREMENT, " + 
            "nombre_estado VARCHAR(255), " +
            "created_at DATETIME, " + 
            "updated_at DATETIME, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE estado_solicitud_inscripcion"
}