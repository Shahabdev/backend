import express from "express"
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(cors({
    origin : "*",
    credentials : true

}));

app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({extended : true,limit : "16kb"}));
app.use(express.static("public"));
app.use(cookieParser())

/// --- import router ----------->
import userRouter from "./routes/user.routes.js"

app.use("/api/v2/users",userRouter)


export { app };