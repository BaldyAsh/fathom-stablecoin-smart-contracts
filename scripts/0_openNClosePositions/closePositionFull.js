// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");
// const MaxUint256 = require("@ethersproject/constants");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const wipeAllAndUnlockXDC = async (proxyWallet, positionId, collateralAmount) => {
  console.log("closePosition1");


  const wipeAllAndUnlockXDCAbi = [
      "function wipeAllAndUnlockXDC(address _manager, address _xdcAdapter, address _stablecoinAdapter, uint256 _positionId, uint256 _collateralAmount, bytes calldata _data)"
  ];
  const wipeAllAndUnlockXDCIFace = new ethers.utils.Interface(wipeAllAndUnlockXDCAbi);
  const closePositionCall = wipeAllAndUnlockXDCIFace.encodeFunctionData("wipeAllAndUnlockXDC", [
      "0x9661dCD4043eDb266a43e4Bd65DCae87dE051FD6", //Position Manager
      "0x7793129dDB6de37249eF98168D989e5E2fBee76E", //AnkrCollateralAdapter
      "0x2A63856eba3F3A1B07B6Cf3296D5e6f601E26044", // StablecoinAdapter
      positionId,
      collateralAmount, // wad
      "0x00"
  ])
  console.log(closePositionCall);
  console.log("closePosition2");
  await proxyWallet.execute(closePositionCall)
  console.log("closePosition3");
}

module.exports = async function(deployer) {

  const devDeployer = "0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3";

  const proxyWalletRegistry = await artifacts.initializeInterfaceAt("ProxyWalletRegistry", "0x97307cA8744d7ab35e75BdC54194fcC003F5222b");

  const proxyWalletDevDeployerAddress = await proxyWalletRegistry.proxies(devDeployer)

  const proxyWalletAsDevDeployer = await artifacts.initializeInterfaceAt("ProxyWallet", proxyWalletDevDeployerAddress);

  const positionManager = await artifacts.initializeInterfaceAt("PositionManager", "0x9661dCD4043eDb266a43e4Bd65DCae87dE051FD6");

  const lastPositionId = await positionManager.ownerLastPositionId();

  const bookKeeper = await artifacts.initializeInterfaceAt("BookKeeper", "0xe9f8f2B94dFA17e02ce93B9607f9694923Bde153");

  const lockedCollateral = await bookKeeper.positions();

  //I need re compile becausee the position close functions' signatures have changed
  //

  await wipeAllAndUnlockXDC(proxyWalletAsDevDeployer, lastPositionId, lockedCollateral[0]);
  
};