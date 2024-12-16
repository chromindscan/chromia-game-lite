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
      const gameLiteSupported = spec.game_lite_supported === undefined ? true : spec.game_lite_supported;
      if (!gameLiteSupported) return null;

      const functionName = spec.name;

      return {
        id: uuid(),
        fn_name: functionName,
        fn_description: spec.description || `Execute ${functionName} operation`,
        args: [
          {
            id: uuid(),
            name: "instruction",
            description: `Instruction for ${functionName}`,
            type: "string",
          },
        ],
        hint: spec.summary || "Returns the operation result",
        config: {
          method: "post",
          url: `http://localhost:3000${pathUrl}`,
          headers: {
            "Content-Type": "application/json",
            "x-secret-key": secretKey || "test",
          },
          payload: {
            prompt: "{{instruction}}",
          },
          success_feedback:
            "{{response.message}}\nFull result: {{response.result}}",
          error_feedback: "Failed to execute operation",
          headersString: JSON.stringify(
            {
              "Content-Type": "application/json",
              "x-secret-key": secretKey || "test",
              "x-ip": "127.0.0.1",
            },
            null,
            2,
          ),
          payloadString: JSON.stringify(
            {
              prompt: "{{prompt}}",
            },
            null,
            2,
          ),
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
