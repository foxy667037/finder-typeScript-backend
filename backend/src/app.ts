import express from "express";
import cors from "cors";
import getIp from "./routes/getIp/getIpRoutes.js";
import User from "./routes/User/userRoutes.js";
import connectToMongo from "./databases/mongodb/mongodb.js";

const app = express();

const PORT: number = 4000;

const MONGO_URL:string = "mongodb://localhost:27017/";

connectToMongo(MONGO_URL);

app.use(express.json());

app.use(cors()); 

app.use("/api/getIp", getIp);

app.use("/api/user", User);

app.get("/", (req, res) => {
  res.send("backend working!");
});

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});