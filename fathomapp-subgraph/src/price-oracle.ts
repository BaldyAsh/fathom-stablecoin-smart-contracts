import { BigDecimal, BigInt, ByteArray } from "@graphprotocol/graph-ts";
import {LogSetPrice} from "../generated/PriceOracle/PriceOracle"
import { Pool, Position } from "../generated/schema";
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
                pool.collatralPrice = pool.collatralLastPrice = event.params._rawPriceUint.div(Constants.WAD).toBigDecimal()
        }else{
            //Assign the price to old price and then update the current price to latest.
            pool.collatralLastPrice = pool.collatralPrice
            pool.collatralPrice = event.params._rawPriceUint.div(Constants.WAD).toBigDecimal()
        }
        pool.save()

        //Update the safety buffer for positions
        let _debtAccumulatedRate = pool.debtAccumulatedRate
        let _priceWithSafetyMargin = event.params._priceWithSafetyMargin
        for (let i = 0; i < pool.positions.length; ++i) {
            let pos  = Position.load(pool.positions[i])
            if(pos != null && pos.debtShare.gt(BigInt.fromI32(0))){
                let collateralValue = pos.lockedCollateral.times(_priceWithSafetyMargin)
                let debtValue = pos.debtShare.times(_debtAccumulatedRate)
                pos.safetyBuffer = collateralValue.ge(debtValue) ? collateralValue.minus(debtValue) : BigInt.fromString('0')

                //Check if position is unsafe or not
                if(pos.safetyBuffer.equals(BigInt.fromI32(0)) &&
                 pos.debtShare.gt(BigInt.fromI32(0))){
                    pos.positionStatus = 'unsafe'
                 }

                pos.save()
            }
        }
    }
}