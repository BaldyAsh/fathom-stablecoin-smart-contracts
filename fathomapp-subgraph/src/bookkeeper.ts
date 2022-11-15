import { BigInt } from "@graphprotocol/graph-ts"
import {LogAdjustPosition, LogSetTotalDebtCeiling} from "../generated/BookKeeper/BookKeeper"
import {Pool, ProtocolStat } from "../generated/schema"
import { Constants } from "./Utils/Constants"

export function adjustPositionHandler(
    event: LogAdjustPosition
  ): void {
    let poolId = event.params._collateralPoolId
    let pool  = Pool.load(poolId.toHexString())
    if(pool != null){
        pool.lockedCollatral = pool.lockedCollatral.plus(event.params._addCollateral)
        pool.totalBorrowed = pool.lockedCollatral.plus(event.params._addDebtShare)
        pool.totalAvailable = pool.debtCeiling.minus(pool.totalBorrowed)
        pool.tvl = pool.lockedCollatral.times(pool.collatralPrice.div(Constants.RAY))
        pool.save()

        updateProtocolStatEntity()
    }  
  }

  // Update the total TVL in protcol by adding the TVLs from all pools
  function updateProtocolStatEntity(): void {
    let stats  = ProtocolStat.load(Constants.FATHOM_STATS_KEY)
    let aggregatedTVL = BigInt.fromI64(0)
    if(stats != null){
      for (let i = 0; i < stats.pools.length; ++i) {
        let pool  = Pool.load(stats.pools[i])
        if (pool)
          aggregatedTVL.plus(pool.tvl)
      }

      stats.tvl = aggregatedTVL
      stats.save()
    }  
  }

  export function setTotalDebtCeilingHanlder(
    event: LogSetTotalDebtCeiling
  ): void {
    let protocolStat  = ProtocolStat.load(Constants.FATHOM_STATS_KEY)
    if(protocolStat == null){
        protocolStat = new ProtocolStat(Constants.FATHOM_STATS_KEY)
        protocolStat.fxdPrice = BigInt.fromI32(1)
        protocolStat.tvl = BigInt.fromI32(0)
        protocolStat.totalSupply = event.params._totalDebtCeiling //.div(Constants.RAD)
        protocolStat.pools = []
        protocolStat.save()
    }
  }
