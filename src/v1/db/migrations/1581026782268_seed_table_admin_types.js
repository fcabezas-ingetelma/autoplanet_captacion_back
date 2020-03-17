module.exports = {
    "up": "INSERT INTO admin_types VALUES " + 
            "('1', 'SuperAdmin', NOW(), NULL), " + 
            "('2', 'Admin_La_Florida', NOW(), NULL), " + 
            "('3', 'Admin_Quilicura', NOW(), NULL), " + 
            "('4', 'Admin_Pajaritos_3005', NOW(), NULL)", 
    "down": "DELETE FROM admin_types"
}