import express from "express";
import cors from "cors";
import getIp from "./routes/getIp/getIpRoutes.js";
import user from "./routes/user/userRoutes.js";
import connectToMongo from "./databases/mongodb/mongodb.js";
import passwordReset from "./routes/passwordReset/passwordReset.js";
import contactForm from "./routes/contactForm/contactForm.js";
import userActivity from "./routes/userActivity/userActivity.js";

const app = express();

const PORT: number = 4000;

const MONGO_URL: string = "mongodb://localhost:27017/";

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
