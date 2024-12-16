import { createClient, type KeyPair } from "postchain-client";
import { CHROMIA_MAINNET_BRID } from "@goat-sdk/wallet-chromia";
import {
  createConnection,
  createInMemoryEvmKeyStore,
  createKeyStoreInteractor,
} from "@chromia/ft4";

export const setupChromia = async () => {
  const chromiaClient = await createClient({
    nodeUrlPool: ["https://system.chromaway.com:7740"],
    blockchainRid: CHROMIA_MAINNET_BRID.ECONOMY_CHAIN,
  });
  const connection = createConnection(chromiaClient);
  const evmKeyStore = createInMemoryEvmKeyStore({
    privKey: Buffer.from(process.env.EVM_PRIVATE_KEY!, "hex"),
  } as KeyPair);
  const keystoreInteractor = createKeyStoreInteractor(
    chromiaClient,
    evmKeyStore,
  );
  const accounts = await keystoreInteractor.getAccounts();
  const accountAddress = accounts[0].id.toString("hex");

  return {
    connection,
    accountAddress,
    chromiaClient,
    keystoreInteractor,
  };
};
