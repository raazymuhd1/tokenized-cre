import { parseAbi } from "viem";

export const oracle = parseAbi([
    "function isMarketResolved(bytes32 marketId) external view returns(bool)",
    "function resolveMarket(bytes32 marketId, string memory correctAnswer) external"
])