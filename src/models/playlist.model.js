import mongoose ,{ Schema } from "mongoose";

const playlistSchema = Schema({
    name : {
        type : String,
      required : true
    },
    description : {
        type : String,
      required : true
    },
    video : {
      type : mongoose.Types.ObjectId,
      ref : "Video"
    },
    owner : {
      type : mongoose.Types.ObjectId,
      ref : "User"
    },
    
}, {
    timestamp : true
});

export const Playlist = mongoose.model("Playlist",playlistSchema);