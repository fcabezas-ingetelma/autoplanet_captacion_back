module.exports = {
    "up": "CREATE TABLE clients (" + 
            "rut INT NOT NULL, " + 
            "dv VARCHAR(1), " +
            "telefono INT NOT NULL, " + 
            "nombres VARCHAR(255), " + 
            "apellidos VARCHAR(255), " + 
            "fecha_nacimiento VARCHAR(255), " + 
            "edad INT, " + 
            "estado_civil VARCHAR(100), " + 
            "nacionalidad VARCHAR(100), " + 
            "canal INT, " + 
            "rut_captador INT, " +
            "codigo_sms_enviado INT, " + 
            "codigo_sms_validado INT, " + 
            "tipo_cliente VARCHAR(10), " + 
            "respuesta_cliente VARCHAR(2), " + 
            "created_at DATE, " + 
            "updated_at DATE, " + 
            "PRIMARY KEY (rut))",
    "down": "DROP TABLE clients"
}