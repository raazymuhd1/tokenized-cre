import type { Token } from "../types"

const supportedTokensPriceFeeds: Token[] = [
    { id: 1, name: "USDC", address: "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E", amount: 0 },
    { id: 2, name: "SNX", address: "0xc0F82A46033b8BdBA4Bb0B0e28Bc2006F64355bC", amount: 10 },
    { id: 3, name: "LINK", address: "0xc59E3633BAAC79493d908e63626716e204A45EdF", amount: 10 },
    { id: 4, name: "DAI", address: "0x14866185B1962B63C3Ea9E03Bc1da838bab34C19", amount: 10 },
    { id: 5, name: "ETH", address: "0x694AA1769357215DE4FAC081bf1f309aDC325306", amount: 10 },
    { id: 6, name: "BTC", address: "0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43", amount: 10 },
]

export {
    supportedTokensPriceFeeds
}