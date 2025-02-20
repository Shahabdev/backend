import mongoose, { Schema } from "mongoose";
import bcript from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        index: true,
        trim: true
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String
    }

},{
        timestamps: true
    });
    
    /// ----------> use pre hook to encrypt password before storing in bd ------------->
    userSchema.pre("save",async function(next) {
        if(!this.isModified("password")) return next();
        this.password = await bcript.hash(this.password,10);
        next();
        
    });
    
    userSchema.methods.isPasswordCorrect = async function name(password) {
        return await bcript.compare(password,this.password);
        }


    userSchema.methods.generateAccessToken = function(){
        return jwt.sign({
            _id : this._id,
            email : this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

    userSchema.methods.generateRefreshToken = function(){
        return jwt.sign({
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    );
    }  


    export const User = mongoose.model("User",userSchema);
