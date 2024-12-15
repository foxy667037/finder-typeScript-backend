import mongoose from "mongoose";

const connectToMongo = async (MONGO_URL:string) => {
  await mongoose
    .connect(MONGO_URL, {
      dbName: "finder",
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err:Error) => console.error("Connection error:", err));
};

export default connectToMongo;