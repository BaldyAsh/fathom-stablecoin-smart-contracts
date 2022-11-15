import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {Pool, ProtocolStat } from "../generated/schema"
import {
  CollateralPoolConfig, LogInitCollateralPoolId, LogSetDebtCeiling
} from "../generated/CollateralPoolConfig/CollateralPoolConfig"
import { Constants } from "./Utils/Constants"

export function handleLogInitCollateralPoolId(
  event: LogInitCollateralPoolId
): void {
  //Create Protocol stat entity if not exist


  //Save Pool
  let poolId = event.params._collateralPoolId
  let pool  = Pool.load(poolId.toHexString())
  if(pool == null){
    log.info('Creating new pool with id: {}',[poolId.toHexString()])
    pool = new Pool(poolId.toHexString())
    pool.poolName = poolId.toString()
    pool.debtCeiling = event.params._debtCeiling //.div(Constants.RAD)
    pool.liquidtionRatio = event.params._liquidtionRatio
    pool.stabilityFeeRate = event.params._stabilityFeeRate
    pool.tokenAdapterAddress = event.params._adapter
    pool.lockedCollatral = BigInt.fromI32(0)
    pool.debtAccumulatedRate = BigInt.fromI32(0)
    pool.collatralPrice = Constants.DEFAULT_PRICE
    pool.collatralLastPrice = Constants.DEFAULT_PRICE
    pool.totalBorrowed = BigInt.fromI32(0)
    pool.tvl = BigInt.fromI32(0)
    pool.totalAvailable = event.params._debtCeiling
    pool.save()

    log.info('Saving pool information in protocol stat',[])
    let protocolStat  = ProtocolStat.load(Constants.FATHOM_STATS_KEY)
    if(protocolStat != null){
      let pools = protocolStat.pools
      pools.push(poolId.toHexString())
      protocolStat.pools = pools
      protocolStat.save()
    }
  }else{
    log.info('Pool with id {} Found',[poolId.toHexString()])
  }
}

export function handleLogSetDebtCeiling(
  event: LogSetDebtCeiling
): void {
  let poolId = event.params._collateralPoolId
  let pool  = Pool.load(poolId.toHexString())
  if(pool != null){
    pool.debtCeiling = event.params._debtCeiling
    pool.totalAvailable = event.params._debtCeiling
    pool.save()
  }
}