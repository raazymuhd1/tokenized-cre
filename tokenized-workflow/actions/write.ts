import { 
    Runtime, 
    bytesToHex,
    EVMClient,
} from "@chainlink/cre-sdk"
import { setup, reportSign, reportWrite } from "../helper"
import type { Config } from "../types"
// import { market, oracle } from "../../../contracts"
import { getMarketQuestion } from "../helper/agent"
import { checkIsMarketResolved } from "./read"

/**
 * @dev execute market creation
 * @notice trigger capability needs to trigger this function within 4-hour gap daily
 */
async function onMarketCreation(runtime: Runtime<Config>) {
     const { network, evmConfig } = setup(runtime)
     const evmClient = new EVMClient(network.chainSelector.selector)

     // find a market topic using AI AGENT
     const newQuest = getMarketQuestion(runtime).then(quest => {
          runtime.log('signing a report')
          // sign a report
          const signedReport = reportSign(runtime, 
            "(string _topic, uint256 deadline, uint256 timeDelay, uint256 minFunds, uint8 maxTeamAllowed) marketData, string marketCreationAction ", 
              [
                [
                  "who's winning between USA vs IRAN?", // market topic
                  0n, // set market deadline
                  0n, // set market time delay 
                  10000000000000000000n, // 0.1 eth
                  6 // 6 team max allowed to enter a market
                ],
                "create market"
            ]
            )
          runtime.log('writing a report')
      
          // write a report
          const marketWriteResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.marketAddress)
          const txHash = bytesToHex(marketWriteResult?.txHash || new Uint8Array(32))
          runtime.log(`market creation hash ${txHash}`)
      
          // make a post req to my server to also store market data off-chain 
      
          // return txHash
     }).catch(err => {
        runtime.log(`"[MARKET]: failed creating market" ${err}`)
    }) 
}


export {
    onMarketCreation,
    // onMarketResolve,
    // onPrizeDistribution
}