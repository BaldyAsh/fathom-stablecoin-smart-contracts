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
      "0x2fE84707e907eaB4C4E6a91CCe458E648be390Ae",//    positionManager.address,
      "0x2fc7e65023aFF27FA61A573B5C8E3fDe3CE9ef79",//      xdcAdapter.address,
      "0xE3b248A97E9eb778c9B08f20a74c9165E22ef40E", //      stablecoinAdapter.address,
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
  await wipeAndUnlockXDC(147, WeiPerWad.mul(99), WeiPerWad.div(2));
};