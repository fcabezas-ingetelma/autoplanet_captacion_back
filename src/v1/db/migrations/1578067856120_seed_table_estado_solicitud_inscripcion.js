module.exports = {
    "up": "INSERT INTO estado_solicitud_inscripcion VALUES " + 
            "('1', 'RUT NO REGISTRADO', NOW(), NULL), " + 
            "('2', 'RUT REGISTRADO EN GL', NOW(), NULL), " + 
            "('3', 'RUT REGISTRADO EN BD', NOW(), NULL), " + 
            "('4', 'CELULAR INGRESADO', NOW(), NULL), " + 
            "('5', 'SMS VALIDADO', NOW(), NULL), " + 
            "('6', 'SMS INVALIDO', NOW(), NULL), " + 
            "('7', 'ACEPTA PROMOCION', NOW(), NULL), " + 
            "('8', 'NO ACEPTA PROMOCION', NOW(), NULL), " + 
            "('9', 'SINACOFI DATOS OK', NOW(), NULL), " + 
            "('10', 'ERROR SINACOFI DATOS', NOW(), NULL), " + 
            "('11', 'FORMULARIO INGRESADO', NOW(), NULL), " + 
            "('12', 'TERMINOS Y CONDICIONES FIRMADO', NOW(), NULL), " + 
            "('13', 'DATOS GEOLOYALTY INGRESADOS', NOW(), NULL), " + 
            "('14', 'ERROR GEOLOYALTY', NOW(), NULL)", 
    "down": "DELETE FROM estado_solicitud_inscripcion"
}