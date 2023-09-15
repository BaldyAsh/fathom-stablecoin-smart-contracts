// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");
// const MaxUint256 = require("@ethersproject/constants");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");


const wipeAndUnlockXDC = async (positionId, collateralAmount, stablecoinAmount) => {

  const wipeAndUnlockXDCAbi = [
    "function wipeAndUnlockXDC(address _manager, address _xdcAdapter, address _stablecoinAdapter, uint256 _positionId, uint256 _collateralAmount, uint256 _stablecoinAmount, bytes calldata _data)"
];
  const wipeAndUnlockXDCIFace = new ethers.utils.Interface(wipeAndUnlockXDCAbi);
  const closePositionCall = wipeAndUnlockXDCIFace.encodeFunctionData("wipeAndUnlockXDC", [
      "0x762348d386afa72c9C3E7D4CDc59659D2572b68c",//    positionManager.address,
      "0xf7BBB8EFb3C0122759f9066449fb395022543107",//      xdcAdapter.address,
      "0xcDFdCB3B4CdC94F4a4216dCf339a95b69d56824A", //      stablecoinAdapter.address,
      positionId,
      collateralAmount, // wad
      stablecoinAmount, // wad
      0x00,
  ])
  console.log(closePositionCall);
  console.log("closePosition2");
  // await proxyWallet.execute2(fathomStablecoinProxyActions.address, closePositionCall, { from: from })
  console.log("closePosition3");
}

module.exports = async function(deployer) {
  await wipeAndUnlockXDC(5, WeiPerWad.mul(10), WeiPerWad.mul(4000));
};