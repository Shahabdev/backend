import mongoose ,{ Schema } from "mongoose";

const commentSchema = Schema({
    content : {
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
    }
}, {
    timestamp : true
});
commentSchema.plugin(mongooseAggregatePaginate)
export const Comment = mongoose.model("Comment",commentSchema);