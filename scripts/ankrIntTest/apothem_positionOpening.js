// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");


const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");


const { WeiPerWad } = require("../tests/helper/unit");


const openPositionAndDraw = async (proxyWallet, collateral_pool_id, stablecoinAmount) => {
  // const positionManager = await artifacts.initializeInterfaceAt("PositionManager", "0xFDb12e1f3a0FBF10431fF5Ac77b9C9BFD60DC7fb");
  // const stablecoinAdapter = await artifacts.initializeInterfaceAt("StablecoinAdapter", "0x5Ae2B8c9eb8283fc6a2d4CbEdf2aCe165aED12c8");
  // const stabilityFeeCollector = await artifacts.initializeInterfaceAt("StabilityFeeCollector", "0x49432EabefB665d0e0DFb7AE814b93E84797DC3C");
  // const xdcAdapter = await artifacts.initializeInterfaceAt("AnkrCollateralAdapter", "0x0eA0787dDC60ff852bC8bfD30A0B68CA2eED3B7C");


  // "0x7aD16A04cC612d2Ab1fDE424B214a3C36c49E61b", //Position Manager
  // "0x9E26db1dF46C77e8587B4859B8E8a0E0D036fd6C", // StabilityFeeCollector
  // "0x5eC92B5E8527d0C28282d230059E48093aaE9f82", //colTokenAdapter
  // "0xeDDe504B30b8231f8f6f50f4eB5f7b8B4136d18b", // StablecoinAdapter

  console.log("here1");

  const openLockXDCAndDrawAbi = [
      "function openLockXDCAndDraw(address _manager, address _stabilityFeeCollector, address _xdcAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockXDCAndDrawAbi);
  const openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockXDCAndDraw", [
      "0x7aD16A04cC612d2Ab1fDE424B214a3C36c49E61b", //Position Manager
      "0x9E26db1dF46C77e8587B4859B8E8a0E0D036fd6C", // StabilityFeeCollector
      "0x5eC92B5E8527d0C28282d230059E48093aaE9f82", //colTokenAdapter
      "0xeDDe504B30b8231f8f6f50f4eB5f7b8B4136d18b", // StablecoinAdapter
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
  console.log("here2");
  const tx = await proxyWallet.execute(openPositionCall, { value: ethers.constants.WeiPerEther.mul(1480770), gasLimit: 2000000})
  console.log(tx);
                                                                                                        // how much XDC to collateralize
}

module.exports = async function(deployer) {

  //making wallet
  // const proxyWalletRegistry = await ProxyWalletRegistry.at(stablecoinAddress.proxyWalletRegistry);
  // const proxyWalletRegistry = await artifacts.initializeInterfaceAt("ProxyWalletRegistry", "ProxyWalletRegistry");

  //uncomment below to make wallet
  // await proxyWalletRegistry.build(apothemDeployerTest, { from: apothemDeployerTest, gasLimit: 2000000 })
  // const proxyWalletapothemDeployerTest = await proxyWalletRegistry.proxies("0xB4A0403376CA4f0a99b863840EfFf78bc061d71F")
  // let proxyWalletapothemDeployerTest = "0xCd74911Bf1CaFE11c83A4d26597B2dCBe6Dd4993";
  let proxyWalletapothemDeployerTest = "0x4C9B289A30607FC2cDAaC31b2Bc96BfA06ECCf31";

  
  const proxyWalletAsAlice = await artifacts.initializeInterfaceAt("ProxyWallet", proxyWalletapothemDeployerTest);
  // const proxyWalletAsAliceOwner = await proxyWalletAsAlice.owner();
  // console.log(apothemDeployerTest == proxyWalletAsAliceOwner);
                                                                                  //how much FXD to borrow

  // for (let i = 0; i < (26-5); i++) {
    await openPositionAndDraw(proxyWalletAsAlice, COLLATERAL_POOL_ID, WeiPerWad.mul(45000));
  // }
                                                                                  
  // await openPositionAndDraw(proxyWalletAsAlice, COLLATERAL_POOL_ID, WeiPerWad.mul(45000));
};