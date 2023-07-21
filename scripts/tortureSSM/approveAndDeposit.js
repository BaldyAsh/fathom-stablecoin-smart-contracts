const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');

const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");


const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const SSMAddress = '0x40cddC07a9fB92019f7E60934d3c1C15Df451a56';
const SSMWrapperAddress = '0xe0f2b813b681575b1B84e5e7F2eb450b71E8d212';
const USDTx = '0x9dD4761Bd68169478a06156c0C1416fB9506BE78';
const FXD = '0xEd816e06cdb7B449bFa9fdB7A55d95A85A224Ecc';
const EOA = '0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3';
const TO_APPROVE_FXD = ethers.BigNumber.from('5000000000000000000000');
const TO_APPROVE_USDT = ethers.BigNumber.from('500000000')
const TO_DEPOSIT_FXD = ethers.BigNumber.from('200000000000000000000');
const TO_DEPOSIT_USDT = ethers.BigNumber.from('500000000');

module.exports = async function(deployer) {

  const addresses = getAddresses(deployer.networkId())

  const stableSwapModule = await artifacts.initializeInterfaceAt("StableSwapModule", SSMAddress);
  const stableSwapWrapper = await artifacts.initializeInterfaceAt("StableSwapModuleWrapper", SSMWrapperAddress);

  const usdtX = await artifacts.initializeInterfaceAt("ERC20Mintable", USDTx);
  const fxd = await artifacts.initializeInterfaceAt("ERC20Mintable", FXD);

  console.log("Approving USDTx")
  await usdtX.approve(stableSwapWrapper.address, TO_APPROVE_USDT.toString())
  
  console.log("Approving FXD")
  await fxd.approve(stableSwapWrapper.address, TO_APPROVE_FXD.toString())
  
  console.log("Deposit Tokens")
  await stableSwapWrapper.depositTokens(TO_DEPOSIT_FXD.toString())
};