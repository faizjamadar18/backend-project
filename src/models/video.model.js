import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// aggregate : This is more powerful than find(). for filtering data before returnning 
// paginate means : ading pages e.g: 1-10 pages 

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)
// usecase in the code : 
// const getVideos = async (req, res) => {
//   const result = await Video.aggregatePaginate(
//     Video.aggregate([{ $match: { isPublished: true } }]),
//     { page: 1, limit: 5 }
//   );

//   res.json(result);
// };


export const Video = mongoose.model("Video", videoSchema)