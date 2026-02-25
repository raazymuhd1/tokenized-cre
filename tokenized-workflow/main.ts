import { CronCapability, handler, Runner, type Runtime, EVMClient } from "@chainlink/cre-sdk";
import { handleDepositCollaterals, handleRedeemCollaterals } from "./actions/write"
import { Config } from "./types";
import { supportedTokensPriceFeeds } from "./constants";
import { fetchTokensPrices } from "./actions/read"
import { setup } from "./helper";

const USER = ""

const onDepositCollaterals = (runtime: Runtime<Config>): string => {
    // get user collaterals
    const { network } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    // for production, this workflow needs to be triggered by external server when user wants to deposit collaterals
    // needs a http triggers capability implemented here to trigger deposit collaterals function
    const tokenValuesInUsd = fetchTokensPrices(runtime, evmClient,supportedTokensPriceFeeds)
    // below is for testing
    // const depositCollateralsHash = handleDepositCollaterals(
    //   runtime, 
    //   supportedTokensPriceFeeds, // test collaterals
    //   USER // test user
    // )
    runtime.log("COLLATERALS DEPOSITED")
    return "Collaterals" 
}

const onRedeemCollaterals = (runtime: Runtime<Config>): string  => {
    const redeemTxHash = handleRedeemCollaterals(
       runtime,
       supportedTokensPriceFeeds,
       USER
    ) 
    return redeemTxHash
}

const initWorkflow = (config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ), 
      onDepositCollaterals
    ),
    // handler(
    //   cron.trigger({
    //     schedule: config.schedule
    //   }),
    //   onRedeemCollaterals
    // )
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
