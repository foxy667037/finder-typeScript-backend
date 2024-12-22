import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import user from "./routes/user/userRoutes.js";
import getIp from "./routes/getIp/getIpRoutes.js";
import connectToMongo from "./databases/mongodb/mongodb.js";
import contactForm from "./routes/contactForm/contactForm.js";
import userActivity from "./routes/userActivity/userActivity.js";
import passwordReset from "./routes/passwordReset/passwordReset.js";

dotenv.config();

const app = express();

const PORT: number = 4000;

const MONGO_URL: string = `mongodb+srv://${process.env.MONGO_CONNECT_URL_USER}:${process.env.MONGO_CONNECT_URL_PASS}@trango-db.0jcyp.mongodb.net/?retryWrites=true&w=majority`;

connectToMongo(MONGO_URL);

app.use(express.json());

app.use(cors());

app.use("/api/user", user);

app.use("/api/getIp", getIp);

app.use("/api/contact-form", contactForm);

app.use("/api/user-activity", userActivity);

app.use("/api/password-reset", passwordReset);

app.get("/", (req, res) => {
  res.status(200).json({msg: "backend working!"});
});

app.listen(PORT, () => {
  console.log(`Service is running on port http://127.0.0.1:${PORT}`);
});
