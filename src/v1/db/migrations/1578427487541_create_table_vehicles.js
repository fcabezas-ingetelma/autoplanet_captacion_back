module.exports = {
    "up": "CREATE TABLE vehicles (" + 
            "patente VARCHAR(100) NOT NULL, " + 
            "marca VARCHAR(100) NOT NULL, " + 
            "modelo VARCHAR(100) NOT NULL, " +
            "tipo VARCHAR(100), " + 
            "anio_fabricacion VARCHAR(100), " + 
            "tasacion_desde INT, " + 
            "tasacion_hasta INT, " + 
            "rut_cliente INT, " + 
            "PRIMARY KEY (patente), " +
            "FOREIGN KEY (rut_cliente) REFERENCES clients(rut))",
    "down": "DROP TABLE vehicles"
}