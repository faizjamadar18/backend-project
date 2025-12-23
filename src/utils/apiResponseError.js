class ApiResponseError {
    constructor(statusCode,data,message = "SUCCES"){
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = statusCode < 400
    }
}