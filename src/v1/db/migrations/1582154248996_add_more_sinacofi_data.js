module.exports = {
    "up": `ALTER TABLE clients 
                ADD sexo VARCHAR(10) AFTER edad, 
                ADD fecha_matrimonio VARCHAR(10) AFTER estado_civil, 
                ADD direccion VARCHAR(255) AFTER nacionalidad, 
                ADD ciudad VARCHAR(255) AFTER direccion, 
                ADD comuna VARCHAR(255) AFTER ciudad`,
    "down": `ALTER TABLE clients 
                DROP sexo, 
                DROP fecha_matrimonio, 
                DROP direccion, 
                DROP ciudad, 
                DROP comuna`
}