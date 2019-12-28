export const SERVER_ERROR_CODE = 500;
export const SERVER_OK_CODE = 200;

export const ERROR_MESSAGE = 'Ha habido un problema al procesar su solicitud. Por favor, intente nuevamente';

export function createGenericJSONResponse(responseCode, responseMessage) {
    let response = {
        code: responseCode,
        message: responseMessage
    }
    return JSON.stringify(response);
}

export function createGenericErrorJSONResponse() {
    let response = {
        code: SERVER_ERROR_CODE,
        message: ERROR_MESSAGE
    }
    return JSON.stringify(response);
}