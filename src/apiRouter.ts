import express from "express";
import { secretKeyMiddleware } from "./middleware/secretKeyMiddleware";
import { ipMiddleware } from "./middleware/ipMiddleware";
import { setupGoatAI } from "./services/goat";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { setupChromia } from "./services/chromia";
import { CHR_ASSET_ID } from "@goat-sdk/wallet-chromia";

const router = express.Router();

router.use(express.json());
router.use(secretKeyMiddleware);
router.use(ipMiddleware);

// curl -X GET -H "Content-Type: application/json" -H "x-secret-key: test" -H "x-ip: 127.0.0.1" http://localhost:3000/api/v1/
router.route("/").get((req, res) => {
  res.send("Hello World");
});

// curl -X GET -H "Content-Type: application/json" -H "x-secret-key: test" -H "x-ip: 127.0.0.1" http://localhost:3000/api/v1/balance?address=73863faabbd82574357f0dbe934ba812e5b2d72e98e590345d1fb29ac5aa0d0c
router.route("/balance").get(async (req, res) => {
  const { address } = req.query;
  const {connection} = await setupChromia();
  const account = await connection.getAccountById(address as string);
  const balance = await account?.getBalanceByAssetId(CHR_ASSET_ID);
  const finalBalance = balance?.amount.dividedBy(balance?.asset.decimals);

  res.json({
    balance: finalBalance?.toString(),
    asset: {
      id: balance?.asset.id.toString("hex"),
      name: balance?.asset.name,
      decimals: balance?.asset.decimals,
      symbol: balance?.asset.symbol,
      iconUrl: balance?.asset.iconUrl,
      supply: balance?.asset.supply.toString(),
      blockchainRid: balance?.asset.blockchainRid.toString("hex"),
      type: balance?.asset.type,
    },
  });
});

// curl -X POST -H "Content-Type: application/json" -H "x-secret-key: test" -H "x-ip: 127.0.0.1" -d '{"prompt":"Send 0.001CHR to xyz account"}' http://localhost:3000/api/v1/send-chr
router.route("/send-chr").post(async (req, res) => {
  const { prompt } = req.body;
  const tools = await setupGoatAI();
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools,
    maxSteps: 3,
    prompt
  });
  console.log("RESULT: ", result.text);
  res.json({
    message: result.text,
    result: result
  });
});

export const apiRouter = router;
