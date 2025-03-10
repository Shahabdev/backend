const asyncHandler = (requestHandler) => (req,res,next) => {
     return Promise.resolve(requestHandler(req,res,next)).catch((error)=> next(error));
}

export { asyncHandler }

  /// -------------> another method with try and catch ----------->
// const asyncHandler = (requestHandler) => async(req ,res,next) => {
//   try {
//     await requestHandler(req,res,next);
    
//   } catch (error) {
//        res.status(error.code || 500).json({
//         success : false,
//         msg : error.message
//        })
    
//   }
// }