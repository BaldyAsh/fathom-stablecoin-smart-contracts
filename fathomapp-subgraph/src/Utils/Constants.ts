import { BigDecimal, BigInt } from "@graphprotocol/graph-ts"

export class Constants{
    public static FATHOM_STATS_KEY:string = 'fathom_stats'
    public static DEFAULT_PRICE:BigDecimal = BigDecimal.fromString('0')

    public static ADDR_COLLATERAL_POOL_CONFIG:string = '0x3de01254c9C66147eBe9Dc7254708d7f3E1d71eC'
    public static ADDR_POSITION_MANAGER:string = '0xB06CE4342a98046c7079603a2a86efda1A24eeE0'

    public static WAD:BigInt = BigInt.fromI64(10**18)
    public static RAY:BigInt = BigInt.fromI64( 10**27)
    public static RAD:BigInt = BigInt.fromI64( 10**45)

    public  static divByRAY(number: BigInt): BigInt {
        return number.div(Constants.WAD).div(BigInt.fromI64(10**9))
    }

    public  static divByRAYToDecimal(number: BigInt): BigDecimal {
        return number.toBigDecimal().div(Constants.WAD.toBigDecimal()).div(BigInt.fromI64(10**9).toBigDecimal())
    }

    public  static divByRAD(number: BigInt): BigInt {
        return number.div(Constants.WAD).div(Constants.WAD).div(BigInt.fromI64(10**9))
    }

    public  static divByRADToDecimal(number: BigInt): BigDecimal {
        return number.toBigDecimal().div(Constants.WAD.toBigDecimal()).div(Constants.WAD.toBigDecimal()).div(BigInt.fromI64(10**9).toBigDecimal())
    }
}