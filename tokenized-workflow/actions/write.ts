import { 
    Runtime, 
    bytesToHex,
    EVMClient,
} from "@chainlink/cre-sdk"
import { setup, reportSign, reportWrite } from "../helper"
import type { Config, Token } from "../types"
import { calculateShare } from "./read"
import { supportedTokensPriceFeeds } from "../constants"

function handleDepositCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
) {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const filteredCollaterals = collaterals.filter(col => col.address)
    const collateralsAmounts = collaterals.filter(colla => BigInt(colla.amount))
    const sharesToMint = calculateShare(runtime, collaterals)

    try {
        runtime.log('signing a collateral deposit report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, address[] collaterals, uint256[] amounts, uint256 sharesToMint ", 
         [
           true, // idDeposit
           0, // tokenId
           "", // user addr
           filteredCollaterals, // collaterals
           collateralsAmounts, // token amounts
           sharesToMint // shares to mint
         ]
       )
     runtime.log('writing a collateral deposit report')
       
     // write a report
     const depositColResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.marketAddress)
     const txHash = bytesToHex(depositColResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral deposit's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Deposit-Collateral]: something went wrong on deposit collateral ${error}`)
    }
}

function handleRedeemCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
) {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const sharesToBurn = calculateShare(runtime, collaterals)

    try {
        runtime.log('signin a collateral redemption report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, uint256 sharesToBurn, address receiver", 
         [
           false, // idDeposit
           0, // tokenId
           user, // user addr
           sharesToBurn, // shares to burn
           user // receiver
         ]
       )
     runtime.log('writing a collateral redemption report')
       
     // write a report
     const redeemResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.marketAddress)
     const txHash = bytesToHex(redeemResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral redemption's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Redeem-Collateral]: something went wrong on redeem collateral ${error}`)
    }
}

export {
  handleDepositCollaterals,
  handleRedeemCollaterals
}