import {v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath){
            console.log("the path is null -------->");
            return  null;
        }
        const response  =  await cloudinary.uploader.upload(localFilePath,{
            /// ---- image ,pdf,video etc ------->
            resource_type : "auto"
        });
        console.log("url---->",response.url);
       // fs.unlinkSync(localFilePath)
        return  response;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        console.log("failed upload file",error);
        return null;
    }
}

export { uploadOnCloudinary };

