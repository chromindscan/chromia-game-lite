import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { apiRouter } from "./apiRouter";
import { specs, swaggerUi } from "./swagger";

const app = express();

// Add Swagger UI documentation route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.use("/api/v1", apiRouter);

app.listen(3000, () => {
  console.log("Server is running on port http://localhost:3000");
});
