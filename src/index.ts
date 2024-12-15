import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { apiRouter } from "./apiRouter";

const app = express();

app.use("/api/v1", apiRouter);

app.listen(3000, () => {
  console.log("Server is running on port https://localhost:3000");
});
