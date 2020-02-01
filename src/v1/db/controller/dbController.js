import * as CONSTANTS from '../../http/constants/constants';
import * as Utils from '../../utils/utils';
import openDBConnection from '../openConnection';

export async function initTracker(response, rut_captador, rut_cliente, ip, cellphone, canal, sku, user_agent, os) {
    const db = openDBConnection();
    try {
        let createdAt = new Date();
        var query = await db.query('INSERT INTO tracker (rut_captador, rut_cliente, IP, telefono, canal, sku, user_agent, os, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    rut_captador, 
                    rut_cliente, 
                    ip,
                    cellphone, 
                    canal, 
                    sku, 
                    user_agent, 
                    os, 
                    createdAt,
                    undefined // Not updated yet
                ]);
        if(query) {
            let data = {
                id: query.insertId,
                rut_captador: rut_captador, 
                rut_cliente: rut_cliente, 
                ip: ip,
                cellphone: cellphone, 
                canal: canal, 
                sku: sku, 
                user_agent: user_agent, 
                os: os, 
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

export async function insertClient(response, rut, dv, cellphone, email, type, name, lastname, birth_date, edad, estado_civil, nacionalidad, sended_sms_code, validated_sms_code, client_response) {
    const db = openDBConnection();
    try {
        var query = await db.query('INSERT INTO clients VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    rut,
                    dv,
                    cellphone, 
                    email, 
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
            case 'ER_DUP_ENTRY': response.status(CONSTANTS.SERVER_OK_CODE); 
                                 break;
            default: response.status(CONSTANTS.BAD_REQUEST_CODE);
        }
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function updateClient(response, rut, cellphone, email, type, client_response) {
    const db = openDBConnection();
    try {
        var query = await db.query(`UPDATE clients SET 
                                        telefono = COALESCE(?, telefono), 
                                        email = COALESCE(?, email), 
                                        tipo_cliente = COALESCE(?, tipo_cliente), 
                                        respuesta_cliente = COALESCE(?, respuesta_cliente), 
                                        updated_at = ? 
                                    WHERE rut = ?`, 
        [ 
            cellphone, 
            email, 
            type, 
            client_response, 
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

export async function updateSMSSended(response, rut, newCode) {
    const db = openDBConnection();
    try {
        var query = await db.query('UPDATE clients SET codigo_sms_enviado = ?, updated_at = ? WHERE rut = ?', 
        [ 
            newCode, 
            new Date(), 
            rut 
        ]);
        var phone = await db.query('SELECT telefono FROM clients WHERE rut = ?', rut);
        if(phone) {
            return phone[0].telefono;
        }
    } catch (err) {
        return null;
    } finally {
        await db.close();
    }
}

export async function validateSMSStatus(response, rut) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT codigo_sms_enviado, codigo_sms_validado, canal, rut_captador FROM clients WHERE rut = ?', rut);
        if(query.length) {
            var sended = query[0].codigo_sms_enviado;
            var validated = query[0].codigo_sms_validado;
            var canal = query[0].canal;
            var rut_captador = query[0].rut_captador;
            if(sended && !validated) {
                //SMS Sended but no validated, must send again
                return CONSTANTS.createCustomJSONResponse(CONSTANTS.SMS_SENDED_BUT_NO_VALIDATED_CODE, CONSTANTS.SMS_SENDED_BUT_NO_VALIDATED);
            } else if(sended && validated) {
                if(canal && rut_captador) {
                    //Process finished
                    return CONSTANTS.createCustomJSONResponse(CONSTANTS.PROCESS_FINISHED_CODE, CONSTANTS.PROCESS_FINISHED);
                } else {
                    const estados = await getClienteEstado(response, rut);
                    if(estados && estados.estadoId && estados.estadoId == 3) {
                        //Process finished
                        return CONSTANTS.createCustomJSONResponse(CONSTANTS.PROCESS_FINISHED_CODE, CONSTANTS.PROCESS_FINISHED);
                    } else {
                        //SMS Sended and validated, must finish process
                        return CONSTANTS.createCustomJSONResponse(CONSTANTS.SMS_SENDED_AND_VALIDATED_CODE, CONSTANTS.SMS_SENDED_AND_VALIDATED);
                    }
                }
            } else {
                if(canal && rut_captador) {
                    //Process finished by WhatsApp
                    return CONSTANTS.createCustomJSONResponse(CONSTANTS.PROCESS_FINISHED_CODE, CONSTANTS.PROCESS_FINISHED);
                } else {
                    const estados = await getClienteEstado(response, rut);
                    if(estados && estados.estadoId && estados.estadoId == 3) {
                        //Process finished by WhatsApp
                        return CONSTANTS.createCustomJSONResponse(CONSTANTS.PROCESS_FINISHED_CODE, CONSTANTS.PROCESS_FINISHED);
                    } else {
                        //Default case, it should no pass here
                        response.status(CONSTANTS.NOT_FOUND_CODE);
                        return CONSTANTS.createCustomJSONResponse(CONSTANTS.NOT_FOUND_CODE, CONSTANTS.ERROR_MESSAGE);
                    }
                }
            }
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function setCanalAndCaptador(response, canal, rut_captador, rut_cliente) {
    const db = openDBConnection();
    try {
        var queryString = `UPDATE clients 
                                    SET {$canal} {$rut_captador} 
                                        updated_at = ?
                                    WHERE rut = ?`;
        var queryArray = [];
        if(canal) {
            queryString = queryString.replace('{$canal}', 'canal = ?,');
            queryArray.push(canal);
        } else {
            queryString = queryString.replace('{$canal}', '');
        }
        if(rut_captador) {
            queryString = queryString.replace('{$rut_captador}', 'rut_captador = ?,');
            queryArray.push(rut_captador);
        } else {
            queryString = queryString.replace('{$rut_captador}', '');
        }

        queryArray.push(new Date(), rut_cliente );
        var query = await db.query(queryString, queryArray);
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

export async function validatePhone(response, rut, cellphone) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT rut, telefono FROM clients WHERE telefono = ?', cellphone);
        if(query.length) {
            if(query[0].rut != rut) {
                //Rut doesn't match, another client is trying to put your phone
                return {
                    isValid: false, 
                    match: false
                }
            } else {
                //Match rut and phone
                return {
                    isValid: true, 
                    match: true
                }
            }
        } else {
            //Phone is not associated with a rut
            return {
                isValid: true, 
                match: false
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
        var selection = await db.query('SELECT estado_id FROM solicitud_inscripcion WHERE rut = ?', rut);
        let createdAt = new Date();
        let query;
        if(selection.length) {
            //There is a solicitud
            query = await db.query('UPDATE solicitud_inscripcion SET estado_id = ?, updated_at = ? WHERE rut = ?',
                    [
                        estado_id,
                        createdAt, 
                        rut
                    ]);
        } else {
            //First time
            query = await db.query('INSERT INTO solicitud_inscripcion (rut, estado_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
                    [
                        rut,
                        estado_id,
                        createdAt,
                        undefined // Not updated yet
                    ]);
        }
        if(query) {
            let data = {
                estado_id: estado_id,
                rut: rut,
                createdOrUpdatedAt: createdAt
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

export async function getClienteEstado(response, rut) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT estado_id FROM solicitud_inscripcion WHERE rut = ?', 
        [
            rut
        ]);
        if(query.length) {
            return {
                estadoId: query[0].estado_id
            }
        } else {
            return {
                estadoId: null
            }
        }
    } catch (err) {
        response.status(CONSTANTS.BAD_REQUEST_CODE);
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function initWSTokenState(cellphone) {
    const db = openDBConnection();
    try {
        const token = Utils.randomTokenGenerator();
        let exists = await db.query('SELECT token FROM wstokens WHERE telefono = ?', [ cellphone ]);
        var query;
        if(exists.length) {
            query = await db.query('UPDATE wstokens SET token = ?, expiration = DATE_ADD(?, INTERVAL 15 MINUTE), validated = FALSE WHERE telefono = ?', 
            [
                token, 
                new Date(), 
                cellphone
            ]);
        } else {
            query = await db.query('INSERT INTO wstokens (telefono, token, expiration, validated) VALUES (?, ?, DATE_ADD(?, INTERVAL 15 MINUTE), ?)', 
            [
                cellphone, 
                token, 
                new Date(), 
                false
            ]);
        }
        if(query) {
            let okModel = CONSTANTS.createGenericDB_OKJSONResponse();
            okModel.token = token;
            return okModel;
        }
    } catch (err) {
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function validateToken(cellphone, token) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT token FROM wstokens WHERE telefono = ? AND expiration <= now() + INTERVAL 15 MINUTE AND validated = FALSE', 
        [
            cellphone
        ]);
        if(query.length && query[0].token === token) {
            return {
                valid: true
            }
        } else {
            return {
                valid: false
            }
        }
    } catch (err) {
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function setTokenUsed(cellphone, token) {
    const db = openDBConnection();
    try {
        var query = await db.query('UPDATE wstokens SET validated = TRUE WHERE telefono = ? AND token = ?', 
        [
            cellphone, 
            token
        ]);
        if(query) {
            return CONSTANTS.createGenericDB_OKJSONResponse();
        }
    } catch (err) {
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function captadorLogin(user, pass) {
    const db = openDBConnection();
    try {
        var query = await db.query('SELECT rut FROM captadores WHERE rut = ? AND password = SHA1(?)', 
        [
            user, 
            pass
        ]);
        if(query.length) {
            const token = Utils.randomTokenGenerator();
            query = await db.query('UPDATE captadores SET token = ?, expiration = DATE_ADD(?, INTERVAL 15 MINUTE) WHERE rut = ?', 
            [
                token, 
                new Date(), 
                user
            ]);
            return {
                loginStatus: true, 
                token: token
            }
        } else {
            return {
                loginStatus: false
            }
        }
    } catch (err) {
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}

export async function getDashBoardData(token, rut_captador) {
    const db = openDBConnection();
    try {
        var tokenValidation = await db.query('SELECT token FROM captadores WHERE rut = ?', 
        [
            rut_captador
        ]);
        if(tokenValidation.length && tokenValidation[0].token === token) {
            let response = {};
            response.visitCounter = (await db.query('SELECT count(*) AS counter FROM tracker WHERE canal = 2'))[0].counter;
            response.enrollmentCounter = (await db.query('SELECT count(*) AS counter FROM clients WHERE canal = 2'))[0].counter;
            response.illussionsGiftVisitCounter = (await db.query('SELECT count(*) AS counter FROM tracker WHERE canal = 18'))[0].counter;
            response.illussionsGiftEnrollmentCounter = (await db.query('SELECT count(*) AS counter FROM clients WHERE canal = 18'))[0].counter;
            response.clientOfferVisitCounter = (await db.query('SELECT count(*) AS counter FROM tracker WHERE canal = 19'))[0].counter;
            response.clientOfferEnrollmentCounter = (await db.query('SELECT count(*) AS counter FROM clients WHERE canal = 19'))[0].counter;
            response.sellerDetail = await db.query(`SELECT t1.rut_captador, t1.Visits, t2.Enrollment
                                                        FROM 
                                                            (SELECT rut_captador, count(*) AS Visits FROM tracker WHERE canal = 2 and rut_captador BETWEEN 1 AND 10 GROUP BY rut_captador) t1
                                                        LEFT JOIN
                                                            (SELECT rut_captador, count(*) AS Enrollment FROM clients WHERE canal = 2 and rut_captador BETWEEN 1 AND 10 GROUP BY rut_captador) t2
                                                        ON (t1.rut_captador = t2.rut_captador)`);
            response.dailyStatus = await db.query(`SELECT V.*, Enrolado_Vendedor, Enrolado_Ipad, Enrolado_Limpia_Tapiz FROM
                                                    (SELECT right(CONCAT('0',cast(day(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2) as dia,
                                                    SUM(case when canal=2 then 1 ELSE 0 END) Visita_Vendedor,
                                                    SUM(case when canal=18 then 1 ELSE 0 END) Visita_Ipad,
                                                    SUM(case when canal=19 then 1 ELSE 0 END) Visita_Limpia_Tapiz
                                                    FROM tracker AS A WHERE canal IN (2,18,19) 
                                                    AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                    GROUP BY right(CONCAT('0',cast(day(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2) 
                                                    UNION all
                                                    SELECT 'Total',
                                                    SUM(case when canal=2 then 1 ELSE 0 END),
                                                    SUM(case when canal=18 then 1 ELSE 0 END),
                                                    SUM(case when canal=19 then 1 ELSE 0 END) 
                                                    FROM tracker AS A WHERE canal IN (2,18,19) 
                                                    AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(NOW())) AS V
                                                LEFT Join
                                                    (SELECT right(CONCAT('0',cast(day(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2) as dia,
                                                    SUM(case when canal=2 then 1 ELSE 0 END) Enrolado_Vendedor,
                                                    SUM(case when canal=18 then 1 ELSE 0 END) Enrolado_Ipad,
                                                    SUM(case when canal=19 then 1 ELSE 0 END) Enrolado_Limpia_Tapiz
                                                    FROM clients AS A WHERE canal IN (2,18,19) 
                                                    AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                    GROUP BY right(CONCAT('0',cast(day(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2)
                                                    UNION all
                                                    SELECT 'Total',
                                                    SUM(case when canal=2 then 1 ELSE 0 END) ,
                                                    SUM(case when canal=18 then 1 ELSE 0 END),
                                                    SUM(case when canal=19 then 1 ELSE 0 END) 
                                                    FROM clients AS A WHERE canal IN (2,18,19) 
                                                    AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                    ) AS E
                                                ON V.dia=E.dia
                                                ORDER BY V.dia`);
            response.hourlyStatus = await db.query(`SELECT V.*, Enrolado_Vendedor, Enrolado_Ipad, Enrolado_Limpia_Tapiz FROM
                                                (SELECT concat(right(CONCAT('0',cast(hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2),'-',right(CONCAT('0',CAST(1+hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2)) as Hora,
                                                SUM(case when canal=2 then 1 ELSE 0 END) Visita_Vendedor,
                                                SUM(case when canal=18 then 1 ELSE 0 END) Visita_Ipad,
                                                SUM(case when canal=19 then 1 ELSE 0 END) Visita_Limpia_Tapiz
                                                FROM tracker AS A WHERE canal IN (2,18,19) 
                                                AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR)) 
                                                AND Day(DATE_ADD(created_at, INTERVAL -3 HOUR)) =day(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                GROUP BY concat(right(CONCAT('0',cast(hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2),'-',right(CONCAT('0',CAST(1+hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2))
                                                UNION all
                                                SELECT 'Total',
                                                SUM(case when canal=2 then 1 ELSE 0 END),
                                                SUM(case when canal=18 then 1 ELSE 0 END),
                                                SUM(case when canal=19 then 1 ELSE 0 END) 
                                                FROM tracker AS A WHERE canal IN (2,18,19) 
                                                AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR)) 
                                                AND Day(DATE_ADD(created_at, INTERVAL -3 HOUR)) =day(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                ) AS V
                                            LEFT Join
                                                (SELECT concat(right(CONCAT('0',cast(hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2),'-',right(CONCAT('0',CAST(1+hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2)) as Hora,
                                                SUM(case when canal=2 then 1 ELSE 0 END) Enrolado_Vendedor,
                                                SUM(case when canal=18 then 1 ELSE 0 END) Enrolado_Ipad,
                                                SUM(case when canal=19 then 1 ELSE 0 END) Enrolado_Limpia_Tapiz
                                                FROM clients AS A WHERE canal IN (2,18,19) 
                                                AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR)) 
                                                AND Day(DATE_ADD(created_at, INTERVAL -3 HOUR)) =day(DATE_ADD(NOW(), INTERVAL -3 HOUR))
                                                GROUP BY concat(right(CONCAT('0',cast(hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2),'-',right(CONCAT('0',CAST(1+hour(DATE_ADD(created_at, INTERVAL -3 HOUR)) AS CHAR)),2))
                                                UNION all
                                                SELECT 'Total',
                                                SUM(case when canal=2 then 1 ELSE 0 END) ,
                                                SUM(case when canal=18 then 1 ELSE 0 END),
                                                SUM(case when canal=19 then 1 ELSE 0 END) 
                                                FROM clients AS A WHERE canal IN (2,18,19) 
                                                AND Month(DATE_ADD(created_at, INTERVAL -3 HOUR)) =month(DATE_ADD(NOW(), INTERVAL -3 HOUR)) 
                                                AND Day(DATE_ADD(created_at, INTERVAL -3 HOUR)) =day(DATE_ADD(NOW(), INTERVAL -3 HOUR))	
                                                ) AS E
                                            ON V.Hora=E.Hora
                                            ORDER BY V.Hora`);
            return {
                status: true, 
                data: response
            }
        } else {
            return CONSTANTS.createCustomJSONResponse(CONSTANTS.INVALID_CAPTADOR_TOKEN_CODE, CONSTANTS.INVALID_CAPTADOR_TOKEN);
        }
    } catch (err) {
        return CONSTANTS.createCustomJSONResponse(err.code, err.sqlMessage);
    } finally {
        await db.close();
    }
}
