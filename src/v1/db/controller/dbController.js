import * as CONSTANTS from '../../http/constants/constants';
import openDBConnection from '../openConnection';

export async function initTracker(response, rut_captador, ip, canal) {
    const db = openDBConnection();
    try {
        let createdAt = new Date();
        var query = await db.query('INSERT INTO tracker (rut_captador, IP, canal, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                [
                    rut_captador,
                    ip,
                    canal,
                    createdAt,
                    undefined // Not updated yet
                ]);
        if(query) {
            let data = {
                id: query.insertId,
                rut_captador: rut_captador,
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

export async function updateTracker(response, tracker_id, rut_captador, ip, canal) {
    const db = openDBConnection();
    try {
        let queryData = makeTrackerUpdateData(tracker_id, rut_captador, ip, canal);
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

function makeTrackerUpdateData(tracker_id, rut_captador, ip, canal) {
    if(tracker_id) {
        let updateString = '';
        let values = [];
        if(rut_captador) {
            updateString = 'rut_captador = ?';
            values.push(rut_captador);
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

export async function insertClient(response, rut, dv, cellphone, type, id_tracker, rut_captador, sended_sms_code, validated_sms_code, client_response) {
    const db = openDBConnection();
    try {
        var query = await db.query('INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    rut,
                    dv,
                    cellphone,
                    id_tracker, //This parameter is not allowed here -> remove
                    rut_captador,
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