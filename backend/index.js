import express from "express";
import env from "./config/envConfig.js";
import httpResponse from "./utils/http-response.js";
import dbConnection from "./config/dbConnection.js";
import { connectRedis } from "./config/redicConnection.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import router from "./src/routes/routes.js";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

dbConnection();
connectRedis();

app.use("/api", router);

app.use("/", (req, resp) => {
  return httpResponse(200, "Hello World!", {}, resp);
});

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
