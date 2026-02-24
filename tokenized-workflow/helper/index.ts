import { 
    EVMClient,
    Report, type Runtime, getNetwork, hexToBase64,
    LATEST_BLOCK_NUMBER,
    encodeCallMsg
} from "@chainlink/cre-sdk";
import { encodeAbiParameters, parseAbiParameters, zeroAddress, encodeFunctionData, decodeFunctionResult, Address, bytesToHex } from "viem"
import type { Config, EvmConfig, SetupData, MappedReadOnchain } from "../types";

type HexString = `0x${string}`

function setup(runtime: Runtime<Config>): SetupData {
    const config = runtime.config;
    const evmConfig = config.evms[0]
    const network = getNetwork({
         chainFamily: "evm",
         chainSelectorName: evmConfig.chainSelectorName,
         isTestnet: true
     })

    if(!network) {
         runtime.log(`Unknown chain name ${evmConfig.chainSelectorName}`)
         throw new Error(`Unknown chain name ${evmConfig.chainSelectorName}`)
     }

     return {
       config,
       evmConfig,
       network
     }
}


function reportDataSetup(typing: string, data: any[] | any[][]): HexString {

    if(!typing) throw new Error("please specify the data type")

    const reportData = encodeAbiParameters(parseAbiParameters(typing), data)
    return reportData
}

/**
 * @dev signing report for onchain write
 */
function reportSign(runtime: Runtime<Config>, typing: string, data: any[] | any[][]): Report {
    const reportData = reportDataSetup(typing, data)
    const signedReport = runtime.report({
       encodedPayload: hexToBase64(reportData),
       encoderName: "evm",
       signingAlgo: "ecdsa",
       hashingAlgo: "keccak256"
    }).result()

    return signedReport
}

function reportWrite(runtime: Runtime<Config>, signedReport: Report, evmConfig: EvmConfig, evmClient: EVMClient, receiver: string) {
       const marketWriteResult = evmClient.writeReport(runtime, {
            receiver,
            report: signedReport,
            gasConfig: {
                gasLimit: evmConfig.gasLimit
            }
            }).result()
    
        runtime.log('writing a report')
    return marketWriteResult
}

function readOnchain<T>(
    runtime: Runtime<Config>,
    evmClient: EVMClient,
    contractAbi: any,
    funcName: string,
    contractAddr: string,
    args?: any[]
): MappedReadOnchain<T> {
        const encodedFuncData = encodeFunctionData({
            abi: contractAbi,
            functionName: funcName,
            args: args ? args : []
        })
    
        const msgCall = evmClient.callContract(runtime, {
            call: encodeCallMsg({
                from: zeroAddress,
                to: contractAddr as Address,
                data: encodedFuncData
            }),
            blockNumber: LATEST_BLOCK_NUMBER
        }).result()
    
        const callResult = decodeFunctionResult({
            abi: contractAbi,
            functionName: funcName,
            data: bytesToHex(msgCall.data)
        })
        runtime.log(`call result ${callResult}`)
        return (callResult as MappedReadOnchain<T>);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export {
    setup,
    reportDataSetup,
    reportSign,
    reportWrite,
    sleep,
    readOnchain
}
