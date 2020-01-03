module.exports = {
    "up": "CREATE TABLE estado_solicitud_inscripcion (" + 
            "id INT AUTO_INCREMENT, " + 
            "nombre_estado VARCHAR(255), " +
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (id))",
    "down": "DROP TABLE estado_solicitud_inscripcion"
}