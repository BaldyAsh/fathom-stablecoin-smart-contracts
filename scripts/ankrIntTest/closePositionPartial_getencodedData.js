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
    "0xFDb12e1f3a0FBF10431fF5Ac77b9C9BFD60DC7fb", //Position Manager
    "0x0eA0787dDC60ff852bC8bfD30A0B68CA2eED3B7C", //colTokenAdapter
    "0x5Ae2B8c9eb8283fc6a2d4CbEdf2aCe165aED12c8", // StablecoinAdapter
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

  await wipeAndUnlockXDC(1, WeiPerWad.mul(38000000), WeiPerWad.mul(1170000));

};

// 2 FXD borrowed, 1 XDC paid.

// when partiially closing, 0.5 XDC 1 FXD will pay

//