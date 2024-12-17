import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import user from "./routes/user/userRoutes.ts";
import getIp from "./routes/getIp/getIpRoutes.ts";
import connectToMongo from "./databases/mongodb/mongodb.ts";
import contactForm from "./routes/contactForm/contactForm.ts";
import userActivity from "./routes/userActivity/userActivity.ts";
import passwordReset from "./routes/passwordReset/passwordReset.ts";

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
  res.send("backend working!");
});

app.listen(PORT, () => {
  console.log(`Service is running on port ${PORT}`);
});
