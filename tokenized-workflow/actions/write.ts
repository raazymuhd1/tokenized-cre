import { 
    Runtime, 
    bytesToHex,
    EVMClient,
} from "@chainlink/cre-sdk"
import { setup, reportSign, reportWrite } from "../helper"
import type { Config, Token } from "../types"
import { calculateShare } from "./read"

// ------------------------------- WRITE FUNCTION S---------------------------------------

function handleDepositCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    let filteredCollaterals: string[] = [], 
    collateralsAmounts: bigint[] = []

    collaterals.forEach(colla => collateralsAmounts.push(BigInt(colla.amount)))
    collaterals.forEach(col => filteredCollaterals.push(col.address))
    const sharesToMint = calculateShare(runtime, collaterals, evmClient)

    try {
        runtime.log('signing a collateral deposit report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, address[] collaterals, uint256[] amounts, uint256 sharesToMint ", 
         [
           true, // isDeposit
           0, // tokenId
           user, // user addr
           filteredCollaterals, // collaterals
           collateralsAmounts, // token amounts
           sharesToMint // shares to mint
         ]
       )
     runtime.log('writing a collateral deposit report')
       
     // write a report
     const depositColResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
     const txHash = bytesToHex(depositColResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral deposit's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Deposit-Collateral]: something went wrong on depositing collateral ${error}`)
        return ""
    }
}

function handleRedeemCollaterals(
  runtime: Runtime<Config>,
  collaterals: Token[],
  user: string
): string {
    const { network, evmConfig } = setup(runtime)
    const evmClient = new EVMClient(network.chainSelector.selector)
    const sharesToBurn = calculateShare(runtime, collaterals, evmClient)

    try {
        runtime.log('signin a collateral redemption report')
        const signedReport = reportSign(runtime, 
       "bool isDeposit, uint256 tokenId, address user, uint256 sharesToBurn, address receiver", 
         [
           false, // isDeposit
           0, // tokenId
           user, // user addr
           sharesToBurn, // shares to burn
           user // receiver
         ]
       )
     runtime.log('writing a collateral redemption report')
       
     // write a report
     const redeemResult = reportWrite(runtime, signedReport, evmConfig, evmClient, evmConfig.vaultAddress)
     const txHash = bytesToHex(redeemResult?.txHash || new Uint8Array(32))
     runtime.log(`collateral redemption's hash ${txHash}`)
     return txHash;
    } catch (error) {
        runtime.log(`[Redeem-Collateral]: something went wrong on redeem collateral ${error}`)
        return ""
    }
}

export {
  handleDepositCollaterals,
  handleRedeemCollaterals
}