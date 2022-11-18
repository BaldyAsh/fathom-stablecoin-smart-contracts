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
    pool.debtCeiling = Constants.divByRAD(event.params._debtCeiling) 
    pool.liquidtionRatio = Constants.divByRAY(event.params._liquidtionRatio)
    pool.stabilityFeeRate = Constants.divByRAY(event.params._stabilityFeeRate)
    pool.tokenAdapterAddress = event.params._adapter
    pool.lockedCollatral = BigInt.fromI32(0)
    pool.collatralPrice = Constants.DEFAULT_PRICE
    pool.collatralLastPrice = Constants.DEFAULT_PRICE
    pool.totalBorrowed = BigInt.fromI32(0)
    pool.tvl = BigDecimal.fromString('0')
    pool.totalAvailable = Constants.divByRAD(event.params._debtCeiling) 
    pool.positions = []

    let collatralConfig = CollateralPoolConfig.bind(Address.fromString(Constants.ADDR_COLLATRAL_POOL_CONFIG))
    pool.debtAccumulatedRate = collatralConfig.getDebtAccumulatedRate(poolId)

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
    pool.debtCeiling =  Constants.divByRAD(event.params._debtCeiling) 
    pool.totalAvailable = Constants.divByRAD(event.params._debtCeiling) 
    pool.save()
  }
}