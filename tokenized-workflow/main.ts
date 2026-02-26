import { CronCapability, handler, Runner, type Runtime, EVMClient } from "@chainlink/cre-sdk";
import { handleDepositCollaterals, handleRedeemCollaterals } from "./actions/write"
import { Config } from "./types";
import { supportedTokensPriceFeeds } from "./constants";
import { fetchTokensPrices } from "./actions/read"
import { setup } from "./helper";

const USER = ""

// ------------------------------------ HANDLER FUNCTIONS ------------------------------

const onDepositCollaterals = (runtime: Runtime<Config>): string => {
    // get user collaterals
    const { network } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    // for production, this workflow needs to be triggered by external server when user wants to deposit collaterals
    // needs a http triggers capability implemented here to trigger deposit collaterals function

    try {
      // below is for testing
      const depositCollateralsHash = handleDepositCollaterals(
        runtime, 
        supportedTokensPriceFeeds, // test collaterals
        USER // test user
      )
      
      runtime.log("COLLATERALS DEPOSITED")
      return "Collaterals" 
    } catch (error) {
      runtime.log("COLLATERALS DEPOSIT FAILED")
      return "" 
    }
}

const onRedeemCollaterals = (runtime: Runtime<Config>): string  => {
    // for production, this workflow needs to be triggered by external server when user wants to deposit collaterals
    // needs a http triggers capability implemented here to trigger deposit collaterals function

    try {
      const redeemTxHash = handleRedeemCollaterals(
         runtime,
         supportedTokensPriceFeeds,
         USER
      ) 
      runtime.log("COLLATERALS REDEEMED")
      return redeemTxHash
      
    } catch (error) {
      runtime.log("COLLATERALS REDEMPTION FAILED")
      return ""
    }
     // below is for testing
}

// IMPORTANT !!!
// WRITE A `HANDLER` function to test your function AND PASS the HANDLER function into the handler function below

const initWorkflow = (config: Config) => {
  // initialize a cron capability
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ), 
      onDepositCollaterals
    ),
    handler(
      cron.trigger({
        schedule: config.schedule
      }),
      onRedeemCollaterals
    )
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
