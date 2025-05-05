import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
           dbName : "notes_app",
        });
        console.log("connected DB")
    } catch (error) {
        console.log(error);
    }
}
export default connectDb;