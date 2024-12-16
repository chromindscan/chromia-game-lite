import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Chromia Demo API",
      version: "1.0.0",
      description: "API documentation for Chromia G.A.M.E lite integration",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Development server",
      },
    ],
  },
  apis: ["./src/apiRouter.ts"], // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
