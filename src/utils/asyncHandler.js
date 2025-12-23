const asyncHandler = (requestHandler) =>{
    return (res,req,next)=>{
        Promise.resolve(requestHandler(res,req,next)).   // Convert async function into Promise
        catch((err)=>next(err)) // if error occur move to next middleware 
    }
}