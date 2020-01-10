module.exports = {
    "up": "CREATE TABLE solicitud_inscripcion (" + 
            "rut INT, " + 
            "estado_id INT, " +
            "created_at DATETIME, " + 
            "updated_at DATETIME, " + 
            "PRIMARY KEY (rut), " + 
            "FOREIGN KEY (estado_id) REFERENCES estado_solicitud_inscripcion(id), " +
            "FOREIGN KEY (rut) REFERENCES clients(rut))",
    "down": "DROP TABLE solicitud_inscripcion"
}