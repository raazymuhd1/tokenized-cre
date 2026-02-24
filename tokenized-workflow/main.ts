import { CronCapability, handler, Runner, type Runtime, EVMClient } from "@chainlink/cre-sdk";
import { checkIsMarketResolved } from "./actions/read"
import { onMarketCreation } from "./actions/write"
import { setup } from "./helper";
import { Config } from "./types";

const onCronTrigger = async(runtime: Runtime<Config>): Promise<string> => {
  const { evmConfig, network } = setup(runtime)
  const evmClient = new EVMClient(network.chainSelector.selector)
  // const isResolved = checkIsMarketResolved(
  //   runtime,
  //   evmClient,
  //   evmConfig,
  //   ""
  // )
  const res = await onMarketCreation(runtime)
  runtime.log(`market creation result ${res}`);
  return 'market created'
};

const initWorkflow = (config: Config) => {
  const cron = new CronCapability();

  return [
    handler(
      cron.trigger(
        { schedule: config.schedule }
      ), 
      onCronTrigger
    ),
  ];
};

export async function main() {
  const runner = await Runner.newRunner<Config>();
  await runner.run(initWorkflow);
}
