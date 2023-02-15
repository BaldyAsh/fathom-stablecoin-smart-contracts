const fs = require('fs');
const rawdata = fs.readFileSync('../../addresses.json');
let stablecoinAddress = JSON.parse(rawdata);

const { MaxUint256 } = require("@ethersproject/constants");

require("dotenv").config();
const USDDepositAmount = process.env.FXDinSSM;
const FXDDepositAmount = process.env.FXDinSSM;
const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");



module.exports = async function(deployer) {

  const addresses = getAddresses(deployer.networkId())

  const stableSwapModule = await artifacts.initializeInterfaceAt("StableSwapModule", stablecoinAddress.stableSwapModule);

  // console.log(typeof(addresses.USD));
  // console.log(typeof(stablecoinAddress.fathomStablecoin));
  const USD = await artifacts.initializeInterfaceAt("ERC20Mintable", addresses.USD);
  const fathomStablecoin = await artifacts.initializeInterfaceAt("ERC20Mintable", stablecoinAddress.fathomStablecoin);

  await USD.approve(stableSwapModule.address,MaxUint256, { gasLimit: 1000000 })
  await fathomStablecoin.approve(stableSwapModule.address,MaxUint256, { gasLimit: 1000000 })

  await stableSwapModule.depositToken(addresses.USD, ethers.constants.WeiPerEther.mul(parseInt(USDDepositAmount,10)),{ gasLimit: 1000000 })
  await stableSwapModule.depositToken(stablecoinAddress.fathomStablecoin , ethers.constants.WeiPerEther.mul(parseInt(FXDDepositAmount,10)),{ gasLimit: 1000000 })

};