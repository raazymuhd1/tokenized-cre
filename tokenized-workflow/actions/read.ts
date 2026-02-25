import type {
    Runtime,
    EVMClient
} from "@chainlink/cre-sdk"
import type { Config, Token } from "../types"
import { readOnchain } from "../helper"
import { ethers } from "ethers"
import { aggregatorV3Interface } from "../contracts"
import { supportedTokensPriceFeeds } from "../constants"

type TokenPrices = (string|bigint)[][]

function fetchTokensPrices(
    runtime: Runtime<Config>, 
    evmClient: EVMClient,
    tokens: Token[]
): TokenPrices {
    let tokenPricesInUsd: TokenPrices = []
    let supportedTokensAddresses: string[] = [];

    supportedTokensPriceFeeds.forEach(token => {
        supportedTokensAddresses.push(token.address)
    })

    for(const token of tokens) {
        if(!supportedTokensAddresses.includes(token.address)) {
            runtime.log(`unsupported tokens ${token.address}`)
            continue;
        }
        
        const priceData = readOnchain<any>(
            runtime, 
            evmClient,
            aggregatorV3Interface,
            "latestRoundData",
            token.address,
            []
        )

        const tokenPrice = String(Object.values(priceData)[1])
        runtime.log(`price of token ${token.name} is ${tokenPrice.slice(0, tokenPrice.length-7)}`)

        tokenPricesInUsd.push([
            token.name,
            BigInt(Number(tokenPrice) * token.amount)
        ]) 

        }

    runtime.log(`token prices in USD ${tokenPricesInUsd}`)
    return tokenPricesInUsd;
}

// #TODO: implement this function to find a correct shares amount (mint/redeem)
/**
 * @dev calculate share for mint/redeem
 * @param runtime 
 * @param tokens 
 */
const calculateShare = (
    runtime: Runtime<Config>, 
    tokens: Token[],
    evmClient: EVMClient
): bigint => {
    const tokensValue = fetchTokensPrices(runtime, evmClient,supportedTokensPriceFeeds.slice(0, 3))
    let totalCollateralValueInUsd: bigint = 0n;
    
    tokensValue.forEach(price => {
        totalCollateralValueInUsd += (price[1] as bigint)
        runtime.log(`[CALCULATING-SHARE]: token ${price[0]} is ${price[1]}`)
    })

    return totalCollateralValueInUsd
}


export {
    calculateShare,
    fetchTokensPrices
}