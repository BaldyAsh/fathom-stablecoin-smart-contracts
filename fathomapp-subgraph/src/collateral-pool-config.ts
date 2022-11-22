import { Address, BigDecimal, BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {Pool, ProtocolStat } from "../generated/schema"
import {
  CollateralPoolConfig, LogInitCollateralPoolId, LogSetDebtCeiling, LogSetLiquidationRatio, LogSetDebtAccumulatedRate
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
    pool.debtCeiling = Constants.divByRAD(event.params._debtCeiling) 
    pool.liquidtionRatio = Constants.divByRAYToDecimal(event.params._liquidtionRatio)
    pool.stabilityFeeRate = Constants.divByRAY(event.params._stabilityFeeRate)
    pool.tokenAdapterAddress = event.params._adapter
    pool.lockedCollatral = BigInt.fromI32(0)
    pool.collatralPrice = Constants.DEFAULT_PRICE
    pool.collatralLastPrice = Constants.DEFAULT_PRICE
    pool.priceWithSafetyMargin = Constants.DEFAULT_PRICE
    pool.totalBorrowed = BigInt.fromI32(0)
    pool.tvl = BigDecimal.fromString('0')
    pool.totalAvailable = Constants.divByRAD(event.params._debtCeiling) 
    pool.positions = []

    let collatralConfig = CollateralPoolConfig.bind(Address.fromString(Constants.ADDR_COLLATRAL_POOL_CONFIG))

    //TODO: BIGDECIMAL... It will change over time.. use LogSetDebtAccumulatedRate.. 10**27
    pool.debtAccumulatedRate = Constants.divByRAYToDecimal(collatralConfig.getDebtAccumulatedRate(poolId))

    pool.save()

    log.info('Saving pool information in protocol stat',[])
    let protocolStat  = ProtocolStat.load(Constants.FATHOM_STATS_KEY)
    
    if(protocolStat == null){
      protocolStat = new ProtocolStat(Constants.FATHOM_STATS_KEY)
      protocolStat.tvl = BigDecimal.fromString('0')
      protocolStat.totalSupply = BigInt.fromI32(0)
      protocolStat.pools = []
    }

    let pools = protocolStat.pools
    pools.push(poolId.toHexString())
    protocolStat.pools = pools
    protocolStat.save()

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
    pool.debtCeiling =  Constants.divByRAD(event.params._debtCeiling) 
    pool.totalAvailable = Constants.divByRAD(event.params._debtCeiling) 
    pool.save()
  }
}

export function handleSetLiquidationRatio(
  event: LogSetLiquidationRatio
): void {
  let poolId = event.params._poolId
  let pool  = Pool.load(poolId.toHexString())
  if(pool != null){
    pool.liquidtionRatio =  Constants.divByRAYToDecimal(event.params._data) 
    pool.save()
  }
}

export function handleSetDebtAccumulatedRate(
  event: LogSetDebtAccumulatedRate
): void {
  let poolId = event.params._collateralPoolId
  let pool  = Pool.load(poolId.toHexString())
  if(pool != null){
    pool.debtAccumulatedRate =  Constants.divByRAYToDecimal(event.params._debtAccumulatedRate) 
    pool.save()
  }
}
