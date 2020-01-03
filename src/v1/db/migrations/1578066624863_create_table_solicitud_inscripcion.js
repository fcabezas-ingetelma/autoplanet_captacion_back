module.exports = {
    "up": "CREATE TABLE solicitud_inscripcion (" + 
            "id INT AUTO_INCREMENT, " + 
            "estado_id INT, " +
            "rut INT, " + 
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (id), " + 
            "FOREIGN KEY (estado_id) REFERENCES estado_solicitud_inscripcion(id), " +
            "FOREIGN KEY (rut) REFERENCES clients(rut))",
    "down": "DROP TABLE solicitud_inscripcion"
}