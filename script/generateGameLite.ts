import dotenv from "dotenv";

import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";
import { specs } from "../src/swagger";
dotenv.config();

const secretKey = process.env.SECRET_KEY;

interface SwaggerSpec {
  name?: string;
  description?: string;
  summary?: string;
  game_lite_supported?: boolean;
  parameters?: any[];
  requestBody?: any;
  responses?: any;
}

const formatGameLiteSpec = () => {
  const customFunctions = Object.entries(
    (specs as any).paths as Record<
      string,
      {
        get?: SwaggerSpec;
        post?: SwaggerSpec;
      }
    >,
  )
    .map(([pathUrl, pathSpec]) => {
      const postSpec = pathSpec.post;
      const getSpec = pathSpec.get;
      if (postSpec == null && getSpec == null) return null;
      const spec = postSpec || getSpec!;
      const method = postSpec ? "post" : "get";
      const gameLiteSupported =
        spec.game_lite_supported === undefined
          ? true
          : spec.game_lite_supported;
      if (!gameLiteSupported) return null;

      const functionName = spec.name;
      const parameters = spec.parameters;
      const requestBody = spec.requestBody;
      const args = [
        ...(parameters || []).map((param) => ({
          id: uuid(),
          name: param.name,
          description: param.description || param.name,
          type: param.schema?.type || "string",
        })),
        ...(requestBody?.content?.["application/json"]?.schema?.properties
          ? Object.entries(
              requestBody.content["application/json"].schema.properties,
            ).map(([name, prop]: [string, any]) => ({
              id: uuid(),
              name,
              description: prop.description || name,
              type: prop.type || "string",
            }))
          : []),
      ];
      const payload: { [name: string]: string } = {};

      Object.assign(
        payload,
        ...(parameters || []).map((param) => ({
          [param.name]: `{{${param.name}}}`,
        })),
        ...(requestBody?.content?.["application/json"]?.schema?.properties
          ? Object.entries(
              requestBody.content["application/json"].schema.properties,
            ).map(([name]) => ({
              [name]: `{{${name}}}`,
            }))
          : []),
      );
      const payloadString = JSON.stringify(payload, null, 2);

      const properties =
        spec.responses?.["200"]?.content["application/json"]?.schema
          ?.properties;
      console.log(properties);

      const successFeedback = Object.keys(properties || {})
      .map(key => {
        if (properties[key].type === 'object' && properties[key].properties) {
          return Object.keys(properties[key].properties)
            .map(nestedKey => `{{response.${key}.${nestedKey}}}`)
            .join('\n');
        }
        return `{{response.${key}}}`;
      })
      .join('\n');
      return {
        id: uuid(),
        fn_name: functionName,
        fn_description: spec.description || `Execute ${functionName} operation`,
        args,
        hint: spec.summary || "Returns the operation result",
        config: {
          method,
          url: `http://localhost:3000/api/v1${pathUrl}`,
          headers: {
            "Content-Type": "application/json",
            "x-secret-key": secretKey || "test",
          },
          payload,
          success_feedback: successFeedback,
          error_feedback: "Failed to execute operation",
          headersString: JSON.stringify(
            {
              "Content-Type": "application/json",
              "x-secret-key": secretKey || "test",
            },
            null,
            2,
          ),
          payloadString,
          isMainLoop: true,
          isReaction: false,
        },
      };
    })
    .filter(Boolean); // Remove null entries

  const gameLiteSpec = {
    customFunctions,
    description: "",
    functions: customFunctions.map((fn) => fn!.fn_name), // List of all function names
    goal: "",
    locationIds: [],
    worldInfo: "",
  };

  return gameLiteSpec;
};

const generateGameLiteJson = () => {
  try {
    const gameLiteSpec = formatGameLiteSpec();
    const outputPath = path.join(__dirname, "../game-lite.json");
    fs.writeFileSync(outputPath, JSON.stringify(gameLiteSpec, null, 2));

    console.log("Successfully generated game-lite.json");
  } catch (error) {
    console.error("Error generating game-lite.json:", error);
    process.exit(1);
  }
};

generateGameLiteJson();
