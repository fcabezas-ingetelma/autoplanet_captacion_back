module.exports = {
    "up": "INSERT INTO canal_promotor VALUES " + 
            "('1', 'WhastApp', NOW(), NULL), " + 
            "('2', 'SMS', NOW(), NULL)", 
    "down": "DELETE FROM canal_promotor"
}