import { 
    Runtime, 
    bytesToHex,
    EVMClient,
} from "@chainlink/cre-sdk"
import { setup, reportSign, reportWrite } from "../helper"
import type { Config } from "../types"
import { checkIsMarketResolved } from "./read"

function onDepositCollaterals(runtime: Runtime<Config>) {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)

    try {
        runtime.log('signing a collateral deposit report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, address[] collaterals, uint256[] amounts, uint256 sharesToMint ", 
         [
           true, // idDeposit
           0, // tokenId
           "", // user addr
           [], // collaterals
           [], // token amounts
           0 // shares to mint
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

function onRedeemCollaterals(runtime: Runtime<Config>) {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)

    try {
        runtime.log('signin a collateral redemption report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, uint256 sharesToBurn, address receiver", 
         [
           false, // idDeposit
           0, // tokenId
           "", // user addr
           0, // shares to burn
           "" // receiver
         ]
       )
     runtime.log('writing a collateral redemption report')
       
     // write a report
     const marketWriteResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.marketAddress)
     const txHash = bytesToHex(marketWriteResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral redemption's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Redeem-Collateral]: something went wrong on redeem collateral ${error}`)
    }
}

export {
  onDepositCollaterals,
  onRedeemCollaterals
}