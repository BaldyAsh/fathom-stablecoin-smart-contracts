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
      "0x9661dCD4043eDb266a43e4Bd65DCae87dE051FD6", //Position Manager
      "0x2b7a0146E88fa7DC334d221561516f751ae3F8b9", // StabilityFeeCollector
      "0x7793129dDB6de37249eF98168D989e5E2fBee76E", //AnkrCollateralAdapter
      "0x2A63856eba3F3A1B07B6Cf3296D5e6f601E26044", // StablecoinAdapter
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
  await openPositionAndDraw(proxyWalletAsDevDeployer, COLLATERAL_POOL_ID, WeiPerWad.mul(66));

};