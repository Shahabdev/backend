import mongoose ,{ Schema } from "mongoose";

const likeSchema = Schema({
    comment : {
        type : mongoose.Types.ObjectId,
      ref : "Comment"
    },
    video : {
      type : mongoose.Types.ObjectId,
      ref : "Video"
    },
    likedBy : {
      type : mongoose.Types.ObjectId,
      ref : "User"
    },
    tweet : {
        type : mongoose.Types.ObjectId,
        ref : "Tweet"
      },
}, {
    timestamp : true
});

export const Like = mongoose.model("Like",likeSchema);