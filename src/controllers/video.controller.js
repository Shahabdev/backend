

const publishVideo = asyncHandler(async(req,res) => {

    try {

        const {title , videoFile, thumbnail,description} = req.body;
        
        
    } catch (error) {
        throw new ApiError(500,error.message);
    }
})