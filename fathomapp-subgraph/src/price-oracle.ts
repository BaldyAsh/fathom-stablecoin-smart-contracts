import { BigDecimal, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import {LogSetPrice} from "../generated/PriceOracle/PriceOracle"
import { Pool } from "../generated/schema";
import { Constants } from "./Utils/Constants";

//TODO: replace _priceWithSafetyMargin with _rawPrice... 
//facing some conversion issue from Bytes to BigInt
export function priceUpdateHandler(event: LogSetPrice): void {
    let poolId = event.params._poolId;
    let pool  = Pool.load(poolId.toHexString())
    if(pool != null){
        //Price is not set yet...
        if(pool.collatralPrice == Constants.DEFAULT_PRICE && 
            pool.collatralLastPrice == Constants.DEFAULT_PRICE){
                pool.collatralPrice = pool.collatralLastPrice = event.params._priceWithSafetyMargin
        }else{
            //Assign the price to old price and then update the current price to latest.
            pool.collatralLastPrice = pool.collatralPrice
            pool.collatralPrice = event.params._priceWithSafetyMargin
        }
        pool.save()
    }
}