const { ethers } = require("ethers");

const { BigNumber } = require("ethers");
const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const { AliceAddress } = require("../tests/helper/address");

const { WeiPerWad } = require("../tests/helper/unit");
const MaxUint256 = require("@ethersproject/constants");


const wipeAndUnlockXDC = async (positionId, collateralAmount, stablecoinAmount) => {

  console.log("parial closePosition");


  const wipeAndUnlockXDCAbi = [
      "function wipeAndUnlockXDC(address _manager, address _xdcAdapter, address _stablecoinAdapter, uint256 _positionId, uint256 _collateralAmount, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const wipeAndUnlockXDCIFace = new ethers.utils.Interface(wipeAndUnlockXDCAbi);
  const closeParialPositionCall = wipeAndUnlockXDCIFace.encodeFunctionData("wipeAndUnlockXDC", [
    "0x7aD16A04cC612d2Ab1fDE424B214a3C36c49E61b", //Position Manager
    "0x5eC92B5E8527d0C28282d230059E48093aaE9f82", //colTokenAdapter
    "0xeDDe504B30b8231f8f6f50f4eB5f7b8B4136d18b", // StablecoinAdapter
      positionId,
      collateralAmount, // wad
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log(closeParialPositionCall);

}

module.exports = async function(deployer) {

  //making wallet
  // const proxyWalletRegistry = await ProxyWalletRegistry.at(stablecoinAddress.proxyWalletRegistry);

  await wipeAndUnlockXDC(1, WeiPerWad.mul(19100000), WeiPerWad.mul(575000));

};

// 2 FXD borrowed, 1 XDC paid.

// when partiially closing, 0.5 XDC 1 FXD will pay

//