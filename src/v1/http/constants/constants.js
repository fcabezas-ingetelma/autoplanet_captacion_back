export const SERVER_ERROR_CODE = 500;
export const BAD_REQUEST_CODE = 400;
export const FORBIDDEN_CODE = 403;
export const NOT_FOUND_CODE = 404;
export const SERVER_OK_CODE = 200;

export const SMS_SENDED_NOT_EXISTS_CODE = 100;
export const SMS_RECEIVED_NOT_MATCH_CODE = 110;
export const SMS_SENDED_BUT_NO_VALIDATED_CODE = 150;
export const SMS_SENDED_AND_VALIDATED_CODE = 160;
export const PROCESS_FINISHED_CODE = 170;

export const ERROR_MESSAGE = 'Ha habido un problema al procesar su solicitud. Por favor, intente nuevamente';
export const SMS_MESSAGE = 'Estimado cliente, su codigo es {$CODE} y es valido por 15 minutos.';
export const DB_OK_MESSAGE = 'DB transaction was OK';
export const DB_UPDATE_OK_MESSAGE = 'DB UPDATE was OK';
export const DB_NO_MATCH_MESSAGE = 'La búsqueda no arrojó resultados para los parámetros ingresados';
export const SMS_SENDED_NOT_EXISTS = 'El código SMS no aparece en los registros. Por favor, intente nuevamente';
export const SMS_RECEIVED_NOT_MATCH = 'El código SMS recibido no coincide con el enviado. Por favor, intente nuevamente';

export const SMS_SENDED_BUT_NO_VALIDATED = 'El código SMS fue enviado pero no validado, reiniciar.';
export const SMS_SENDED_AND_VALIDATED = 'El código SMS fue enviado y validado, finalizar proceso.';
export const PROCESS_FINISHED = 'El usuario ya ha sido registrado con éxito.';

export function createCustomJSONResponse(responseCode, responseMessage) {
    let response = {
        code: responseCode,
        message: responseMessage
    }
    return response;
}

export function createGenericErrorJSONResponse() {
    let response = {
        code: SERVER_ERROR_CODE,
        message: ERROR_MESSAGE
    }
    return response;
}

export function createGenericDB_OKJSONResponse() {
    let response = {
        code: SERVER_OK_CODE,
        message: DB_OK_MESSAGE
    }
    return response;
}