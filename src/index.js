import dotenv from "dotenv";
import connectDB from "./db/Db.js";
import {app } from "./app.js"
/// ---------> configure the env file to use ---------------------------->
dotenv.config({
    path : "./env"
});
/// --------------- connect the db and then run the server ----------------------------->
connectDB().then(()=>{
    app.listen(process.env.PORT,()=> {
        console.log("server is connected on  port",process.env.PORT)
    })
}).catch((error) => {
    console.log("server is connected on  port",process.env.PORT)


})