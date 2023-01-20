const { BigNumber } = require('ethers');
const fs = require('fs');
const rawdata = fs.readFileSync('../../../../addresses.json');
let stablecoinAddress = JSON.parse(rawdata);

const StableSwapModule = artifacts.require('./main/stablecoin-core/StableSwapModule.sol');
// const AUTH_TOKEN_ADAPTER_ADDR = stablecoinAddress.authTokenAdapter;
const STABLECOIN_ADAPTER_ADDR = stablecoinAddress.stablecoinAdapter;
const SYSTEM_DEBT_ENGINE_ADDR = stablecoinAddress.systemDebtEngine;
const WeiPerWad = BigNumber.from(`1${"0".repeat(18)}`)

module.exports =  async function(deployer) {
  console.log(">> Initializing StableSwapModule")

  const stableSwapModule = await StableSwapModule.at(stablecoinAddress.stableSwapModule);
  const dailySwapLimit = WeiPerWad.mul(10000).toString()

  await stableSwapModule.initialize(
    // AUTH_TOKEN_ADAPTER_ADDR,
    stablecoinAddress.bookKeeper,
    STABLECOIN_ADAPTER_ADDR,
    stablecoinAddress.fathomStablecoin,
    dailySwapLimit
  )
};