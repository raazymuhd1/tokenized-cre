import { parseAbi } from "viem"

export const market = parseAbi([
  "function createMarket(string _topic, uint256 deadline, uint256 timeDelay, uint256 minFunds, uint8 maxTeamAllowed) external returns (bytes32)",
  
  "function getAllMarkets() external view returns ((bytes32 marketId, address creator, (string topic, string description, string answer, uint256 deadline, uint256 timeDelay, uint256 minFunds, uint8 yesCount, uint8 noCount, uint8 closed) marketTopic, (bytes32 marketId, bytes32[] teams, uint256 depositedFunds) competingTeams, (bytes32 marketId, bytes32[] teams, uint256 rewards) winningTeams, uint8 maxTeamAllowed, uint256 totalCompetingFunds, uint256 yieldEarned)[] markets)"
])