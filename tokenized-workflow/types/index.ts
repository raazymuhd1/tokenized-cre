import { NetworkInfo } from "@chainlink/cre-sdk"

type EvmConfig = {
   marketAddress: string;
   oracleAddress: string;
   chainSelectorName: string;
   gasLimit: string;
}

type Config = {
  schedule: string;
  apiUrl: string;
  evms: EvmConfig[]
};


type SetupData = {
   config: Config;
   evmConfig: EvmConfig;
   network: NetworkInfo
}

interface MarketTopic {
   topic: string;
   description: string;
   answer: string;
   deadline: BigInt;
   timeDelay: BigInt;
   minFunds: BigInt;
   yesCount: BigInt;
   noCount: BigInt;
   closed: TopicClosed;
}

interface TopicClosed {
   closedAt: BigInt;
   isClosed: boolean;
}

interface WinningTeam {
   marketId: string;
   teams: string[];
   rewards: BigInt;
}

interface CompetingTeam {
   marketId: string;
   teams: string[];
   depositedFunds: BigInt;
}


type Market = {
   marketId: string;
   creator: string;
   marketTopic: MarketTopic;
   competingTeams: CompetingTeam;
   winningTeams: WinningTeam;
   maxTeamAllowed: BigInt;
   totalCompetingFunds: BigInt;
   yieldEarned: BigInt;
}


type ExternalApiResponse = string;

type QueryResult = {
   marketId: string;
   answer: string;
}

type MappedReadOnchain<T> = {
   [Property in keyof T]: T[Property]
};

type MarketResolvedStats = {
   status: boolean;
}

type Token = {
   id: number;
   name: string;
   address: string;
   amount: number;
}

export type {
    EvmConfig,
    Config,
    SetupData,
    Market,
    ExternalApiResponse,
    QueryResult,
    MappedReadOnchain,
    MarketResolvedStats,
    Token
}