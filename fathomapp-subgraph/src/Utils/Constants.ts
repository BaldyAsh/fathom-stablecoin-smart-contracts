import { BigInt } from "@graphprotocol/graph-ts"

export class Constants{
    public static FATHOM_STATS_KEY:string = 'fathom_stats'
    public static DEFAULT_PRICE:BigInt = BigInt.fromI32(0)



    public static ADDR_COLLATRAL_POOL_CONFIG:string = '0xDc5D216d3608e8f3fBC9b864a333C2e4f83E3bA9'

    public static WAD:BigInt = BigInt.fromI64(10**18)
    public static RAY:BigInt = BigInt.fromI64( 10**27)
    public static RAD:BigInt = BigInt.fromI64( 10**45)

}