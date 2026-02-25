import type {
    Runtime,
    EVMClient
} from "@chainlink/cre-sdk"
import type { Config, Token } from "../types"
import { readOnchain } from "../helper"
import { ethers } from "ethers"
import { aggregatorV3InterfaceABI } from "../contracts/abi/aggregatorV3"
import { supportedTokensPriceFeeds } from "../constants"


function fetchTokensPrices(runtime: Runtime<Config>, tokens: Token[]): string {
    const rpcUrl = runtime.getSecret({ id: "SEPOLIA_RPC" }).result()
    const provider = new ethers.JsonRpcProvider(rpcUrl.value)
    const totalTokenValue: string = ""

    for(const token of tokens) {
        if(supportedTokensPriceFeeds.includes(token)) {
            runtime.log(`unsupported tokens ${token.address}`)
            continue;
        }
        const priceFeeds = new ethers.Contract(token.address, aggregatorV3InterfaceABI, provider)
        let price: string = "";

        priceFeeds.latestRoundData()
        .then(data => {
            runtime.log(`price for token ${token.name} is ${data}`)
            price = data;
        })
        .catch(err => runtime.log(`fetching price data failed ${err}`))
    }

    return "tokens"
}

/**
 * @dev calculate share for mint/redeem
 * @param runtime 
 * @param tokens 
 */
const calculateShare = (runtime: Runtime<Config>, tokens: Token[]): bigint => {
    const tokensValue = fetchTokensPrices(runtime, supportedTokensPriceFeeds.slice(0, 3))

    return 100n
}


export {
    calculateShare
}