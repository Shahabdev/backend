import mongoose,{Schema} from "mongoose";
import mongooseAgregation from "mongoose-aggregate-paginate-v2"

const videoSchema = Schema({
  videoFile : {
    type : String,
    required : true
  },
  thumbnail : {
    type : String ,
    required : true
  },
  title : {
    type : String,
    required : true
  },
  description : {
    type : String,
    required : true
  },
  views : {
    type : Number,
    default : 0
  },
  isPublished : {
    type : Boolean,
    default : true
  },
  owner : {
    type : Schema.type.ObjectId,
    ref : "User"
  },


},{timestamps : true});

videoSchema.plugin(mongooseAgregation)

export const Video = mongoose.model("Video",videoSchema);