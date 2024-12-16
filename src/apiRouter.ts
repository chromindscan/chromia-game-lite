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

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     secretKey:
 *       type: apiKey
 *       in: header
 *       name: x-secret-key
 *       description: API secret key for authentication
 */

/**
 * @swagger
 * /:
 *   get:
 *     name: health_check
 *     summary: Basic health check endpoint
 *     description: Returns a simple "Hello World" message to verify the API is running
 *     tags:
 *       - Health
 *     security:
 *       - secretKey: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Whether the operation was successful
 *                   example: true
 *                 message:
 *                   type: string
 *                   description: Response message
 *                   example: "Hello World"
 *       401:
 *         description: Unauthorized - Invalid or missing secret key
 */
router.route("/").get((req, res) => {
  res.json({
    success: true,
    message: "Hello World",
  });
});

/**
 * @swagger
 * /balance:
 *   get:
 *     name: get_chr_balance
 *     summary: Get account balance
 *     description: Retrieves the CHR token balance for a specified blockchain address
 *     game_lite_supported: true
 *     tags:
 *       - Balance
 *     security:
 *       - secretKey: []
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: The blockchain address to check the balance for
 *         example: "73863faabbd82574357f0dbe934ba812e5b2d72e98e590345d1fb29ac5aa0d0c"
 *     responses:
 *       200:
 *         description: Successful response with balance information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: string
 *                   description: The account balance
 *                   example: "0.001"
 *                 asset:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Asset ID in hexadecimal
 *                     name:
 *                       type: string
 *                       description: Asset name
 *                     decimals:
 *                       type: number
 *                       description: Number of decimal places
 *                     symbol:
 *                       type: string
 *                       description: Asset symbol
 *                     iconUrl:
 *                       type: string
 *                       description: URL to asset icon
 *                     supply:
 *                       type: string
 *                       description: Total supply
 *                     blockchainRid:
 *                       type: string
 *                       description: Blockchain RID in hexadecimal
 *                     type:
 *                       type: string
 *                       description: Asset type
 *       401:
 *         description: Unauthorized - Invalid or missing secret key
 *       400:
 *         description: Bad Request - Missing or invalid address parameter
 */
router.route("/balance").get(async (req, res) => {
  const { address } = req.query;
  const { connection } = await setupChromia();
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

/**
 * @swagger
 * /send-chr:
 *   post:
 *     name: send_chr
 *     summary: Send CHR tokens
 *     description: Processes a natural language prompt to send CHR tokens
 *     tags:
 *       - Transactions
 *     security:
 *       - secretKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: Natural language prompt describing the transaction
 *                 example: "Send 0.001CHR to xyz account"
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Response message
 *                 result:
 *                   type: object
 *                   description: Detailed result of the operation
 *       401:
 *         description: Unauthorized - Invalid or missing secret key
 */
router.route("/send-chr").post(async (req, res) => {
  const { prompt } = req.body;
  const tools = await setupGoatAI();
  const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools,
    maxSteps: 3,
    prompt,
  });
  console.log("RESULT: ", result.text);
  res.json({
    message: result.text,
    result: result,
  });
});

export const apiRouter = router;
