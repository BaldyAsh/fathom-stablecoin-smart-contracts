// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const openPositionAndDraw = async (proxyWallet, collateral_pool_id, stablecoinAmount) => {

  console.log("here1");

  const openLockXDCAndDrawAbi = [
      "function openLockXDCAndDraw(address _manager, address _stabilityFeeCollector, address _xdcAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockXDCAndDrawAbi);
  const openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockXDCAndDraw", [
    "0x546a8F92946aDc1e5227446209dc3E2301E75Aa6", //Position Manager
    "0xFa93093E02de24825483f94A71003480b76043A3", // StabilityFeeCollector
    "0xF7C87b68Fc1d59C1D3aab7dcFAdf25a6925649F8", //AnkrCollateralAdapter
    "0x4b94659CC3d42Beaca646D67E73435556d0D3512", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("below is the encoded data");
  console.log(openPositionCall);

  // await proxyWallet.execute(openPositionCall, {value: ethers.constants.WeiPerEther.mul(getRandomNumber())})
  await proxyWallet.execute(openPositionCall, {value: ethers.constants.WeiPerEther.mul(2000)})

}

function getRandomNumber() {
  const min = ethers.BigNumber.from('2000');
  const max = ethers.BigNumber.from('3000');
  const range = max - min;

  // Generate random bytes
  const randomBytes = ethers.utils.randomBytes(32);
  
  // Convert bytes to a BigNumber within the range
  const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
  
  return randomNumber.toString();
}


function getRandomNumber2() {
  const min = ethers.BigNumber.from('20');
  const max = ethers.BigNumber.from('30');
  const range = max - (min);

  // Generate random bytes
  const randomBytes = ethers.utils.randomBytes(32);
  
  // Convert bytes to a BigNumber within the range
  const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
  
  return randomNumber.toString();
}

module.exports = async function(deployer) {

  const devDeployer = "0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3";

  const proxyWalletRegistry = await artifacts.initializeInterfaceAt("ProxyWalletRegistry", "0x97307cA8744d7ab35e75BdC54194fcC003F5222b");

  const proxyWalletDevDeployerAddress = await proxyWalletRegistry.proxies(devDeployer)

  const proxyWalletAsDevDeployer = await artifacts.initializeInterfaceAt("ProxyWallet", proxyWalletDevDeployerAddress);

  // await openPositionAndDraw(proxyWalletAsDevDeployer, COLLATERAL_POOL_ID, WeiPerWad.mul(getRandomNumber2()));
  await openPositionAndDraw(proxyWalletAsDevDeployer, COLLATERAL_POOL_ID, WeiPerWad.mul(5));

};