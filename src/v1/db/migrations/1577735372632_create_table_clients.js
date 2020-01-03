module.exports = {
    "up": "CREATE TABLE clients (" + 
            "rut INT NOT NULL, " + 
            "dv VARCHAR(1), " +
            "telefono INT NOT NULL, " + 
            "id_tracker INT, " + 
            "rut_captador INT, " +
            "codigo_sms_enviado INT, " + 
            "codigo_sms_validado INT, " + 
            "tipo_cliente VARCHAR(10), " + 
            "respuesta_cliente VARCHAR(2), " + 
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (rut), " + 
            "FOREIGN KEY (id_tracker) REFERENCES tracker(id))",
    "down": "DROP TABLE clients"
}