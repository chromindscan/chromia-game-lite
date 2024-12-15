import { getOnChainTools } from "@goat-sdk/adapter-vercel-ai";
import { chromia } from "@goat-sdk/wallet-chromia";
import { sendCHR } from "@goat-sdk/core";
import { setupChromia } from "./chromia";

export const setupGoatAI = async () => {
    const { chromiaClient, accountAddress, keystoreInteractor, connection } = await setupChromia();
    const tools = await getOnChainTools({
        wallet: chromia({
            client: chromiaClient,
            accountAddress,
            keystoreInteractor,
            connection,
        }),
        plugins: [
            sendCHR()
        ],
    });

    return tools;
}