class ApiErrors extends Error {
    // Error → parent class
    //ApiErrors → child class


    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        // When a class extends another class,
        // you must call super() before using this.
        super(message);  // call the parent class

        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
            // optional : 
            // 👉 Automatically finds where the error happened
            // 👉 Very useful for debugging in backend
        }
    }
}

export {ApiErrors}
