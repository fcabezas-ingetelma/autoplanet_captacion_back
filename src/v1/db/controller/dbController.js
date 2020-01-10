import * as CONSTANTS from '../../http/constants/constants';
import openDBConnection from '../openConnection';

export async function initTracker(response, rut_captador, rut_cliente, ip, canal) {
    const db = openDBConnection();
    try {
        let createdAt = new Date();
        var query = await db.query('INSERT INTO tracker (rut_captador, rut_cliente, IP, canal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
                [
                    rut_captador, 
                    rut_cliente, 
                    ip,
                    canal,
                    createdAt,
                    undefined // Not updated yet
                ]);
        if(query) {
            let data = {
                id: query.insertId,
                rut_captador: rut_captador, 
                rut_cliente: rut_cliente, 
                ip: ip,
                canal: canal,
                createdAt: createdAt
            }
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, data);
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function updateTracker(response, tracker_id, rut_captador, rut_cliente, ip, canal) {
    const db = openDBConnection();
    try {
        let queryData = makeTrackerUpdateData(tracker_id, rut_captador, rut_cliente, ip, canal);
        if(queryData) {
            var query = await db.query(queryData.updateString, queryData.values);
            if(query) {
                return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, CONSTANTS.DB_UPDATE_OK_MESSAGE);
            }
        } else {
            response.status(CONSTANTS.BAD_REQUEST_CODE);
            return CONSTANTS.createGenericErrorJSONResponse();
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

function makeTrackerUpdateData(tracker_id, rut_captador, rut_cliente, ip, canal) {
    if(tracker_id) {
        let updateString = '';
        let values = [];
        if(rut_captador) {
            updateString = 'rut_captador = ?';
            values.push(rut_captador);
        }
        if(rut_cliente) {
            updateString = updateString ? updateString + ', rut_cliente = ?' : updateString + 'rut_cliente = ?';
            values.push(rut_cliente);
        }
        if(ip) {
            updateString = updateString ? updateString + ', IP = ?' : updateString + 'IP = ?';
            values.push(ip);
        }
        if(canal) {
            updateString = updateString ? updateString + ', canal = ?' : updateString + 'canal = ?';
            values.push(canal);
        }

        if(updateString) {
            updateString = updateString ? updateString + ', updated_at = ?' : updateString + 'updated_at = ?';
            values.push(new Date());
        
            updateString = 'UPDATE tracker SET ' + updateString + ' WHERE id = ?';
            values.push(tracker_id);
            return {
                updateString: updateString,
                values: values
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
}

export async function insertClient(response, rut, dv, cellphone, type, name, lastname, birth_date, edad, estado_civil, nacionalidad, sended_sms_code, validated_sms_code, client_response) {
    const db = openDBConnection();
    try {
        var query = await db.query('INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    rut,
                    dv,
                    cellphone,
                    name, 
                    lastname, 
                    birth_date, 
                    edad, 
                    estado_civil, 
                    nacionalidad, 
                    undefined, // Canal data is not set on creation
                    undefined, // rut_captador is not set on creation
                    sended_sms_code,
                    validated_sms_code, 
                    type,
                    client_response, 
                    new Date(),
                    undefined // Not updated yet
                ]);
        if(query) {
            return CONSTANTS.createGenericDB_OKJSONResponse();
        }
    } catch (err) {
        switch (err.code) {
            case 'ER_DUP_ENTRY': response.status(CONSTANTS.FORBIDDEN_CODE); 
                                 break;
            default: response.status(CONSTANTS.BAD_REQUEST_CODE);
        }
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function updateClientFromSinacofi(response, rut, nombres, apellidos, fechaNacimiento, edad, estadoCivil, nacionalidad) {
    const db = openDBConnection();
    try {
        var query = await db.query('UPDATE clients SET nombres = ?, apellidos = ?, fecha_nacimiento = ?, edad = ?, estado_civil = ?, nacionalidad = ?, updated_at = ? WHERE rut = ?', 
        [ 
            nombres, 
            apellidos, 
            fechaNacimiento, 
            edad, 
            estadoCivil, 
            nacionalidad, 
            new Date(), 
            rut 
        ]);
        if(query) {
            return CONSTANTS.createGenericDB_OKJSONResponse();
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function insertVehicle(response, patente, marca, modelo, tipo, anio_fabricacion, tasacion_desde, tasacion_hasta, rut_cliente) {
    const db = openDBConnection();
    try {
        var query = await db.query('INSERT INTO vehicles VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
            patente, 
            marca, 
            modelo, 
            tipo, 
            anio_fabricacion, 
            tasacion_desde, 
            tasacion_hasta, 
            rut_cliente
        ]);
        if(query) {
            return CONSTANTS.createGenericDB_OKJSONResponse();
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function updateSMSData(response, validatedSMSCode, rut) {
    const db = openDBConnection();
    try {
        var query = await db.query('UPDATE clients SET codigo_sms_validado = ?, updated_at = ? WHERE rut = ?', [ validatedSMSCode, new Date(), rut ]);
        if(query) {
            return CONSTANTS.createGenericDB_OKJSONResponse();
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function validatePhone(response, cellphone) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT telefono FROM clients WHERE telefono = ?', cellphone);
        if(query.length) {
            return {
                exists: true
            }
        } else {
            return {
                exists: false
            }
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function validateSMSReceived(response, sms_received, rut) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT codigo_sms_enviado FROM clients WHERE rut = ?', rut);
        if(query.length) {
            let sms_sended = query[0].codigo_sms_enviado;
            if(sms_received == sms_sended) {
                var validSMSSolicitud = await createSolicitud(response, 5 /** status 5 defined on BD, change if needed */, rut);
                var res = {
                    validated: true,
                    solicitud: validSMSSolicitud
                }

                response.status(CONSTANTS.SERVER_OK_CODE);
                return res;
            } else {
                var invalidSMSSolicitud = await createSolicitud(response, 6 /** status 6 defined on BD, change if needed */, rut);
                var res = {
                    validated: false,
                    reason: CONSTANTS.SMS_RECEIVED_NOT_MATCH, 
                    solicitud: invalidSMSSolicitud
                }

                response.status(CONSTANTS.BAD_REQUEST_CODE);
                return res;
            }
        } else {
            var res = {
                validated: false,
                reason: CONSTANTS.SMS_SENDED_NOT_EXISTS, 
                solicitud: invalidSMSSolicitud
            }

            response.status(CONSTANTS.BAD_REQUEST_CODE);
            return res;
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function createSolicitud(response, estado_id, rut) {
    const db = openDBConnection();
    try {
        let createdAt = new Date();
        var query = await db.query('INSERT INTO solicitud_inscripcion (estado_id, rut, created_at, updated_at) VALUES (?, ?, ?, ?)',
                [
                    estado_id,
                    rut,
                    createdAt,
                    undefined // Not updated yet
                ]);
        if(query) {
            let data = {
                id: query.insertId,
                estado_id: estado_id,
                rut: rut,
                createdAt: createdAt
            }
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, data);
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function getEstados(response) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT * FROM estado_solicitud_inscripcion');
        if(query.length) {
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, query);
        } else {
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, CONSTANTS.DB_NO_MATCH_MESSAGE);
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function getEstado(response, estadoId) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT * FROM estado_solicitud_inscripcion WHERE id = ?', 
        [
            estadoId
        ]);
        if(query.length) {
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, query);
        } else {
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.SERVER_OK_CODE, CONSTANTS.DB_NO_MATCH_MESSAGE);
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}