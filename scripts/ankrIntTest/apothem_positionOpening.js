const fs = require('fs');
const rawdata = fs.readFileSync('../../addresses.json');
let stablecoinAddress = JSON.parse(rawdata);

require("dotenv").config();
const deployerEOA = process.env.DEPLOYER_EOA;
const XDC_COL = process.env.XDC_COL;
const FXD = process.env.FXD;
const { ethers } = require("ethers");
const { getProxy } = require("../common/proxies");

const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");


const { WeiPerWad } = require("../tests/helper/unit");


const openPositionAndDraw = async (proxyWallet, collateral_pool_id, stablecoinAmount) => {


  const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");
const positionManager = await getProxy(proxyFactory, "PositionManager");
const stablecoinAdapter = await getProxy(proxyFactory, "StablecoinAdapter");
const stabilityFeeCollector = await getProxy(proxyFactory, "StabilityFeeCollector");
const xdcAdapter = await getProxy(proxyFactory, "AnkrCollateralAdapter");

  const openLockXDCAndDrawAbi = [
      "function openLockXDCAndDraw(address _manager, address _stabilityFeeCollector, address _xdcAdapter, address _stablecoinAdapter, bytes32 _collateralPoolId, uint256 _stablecoinAmount, bytes calldata _data)"
  ];
  const openLockTokenAndDrawIFace = new ethers.utils.Interface(openLockXDCAndDrawAbi);
  const openPositionCall = openLockTokenAndDrawIFace.encodeFunctionData("openLockXDCAndDraw", [
      positionManager.address,
      stabilityFeeCollector.address,
      xdcAdapter.address,
      stablecoinAdapter.address,
      collateral_pool_id,
      stablecoinAmount, // wad
      "0x00",
  ])
                                                              //2023 feb 15th, this xdc amount and fxd amount also better be adjusted in .env or external json file
  await proxyWallet.execute(openPositionCall, { value: ethers.constants.WeiPerEther.mul(parseInt(XDC_COL,10)), gasLimit: 2000000})
                                                                                                        // how much XDC to collateralize
}

module.exports = async function(deployer) {

const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");

  const proxyWalletRegistry = await getProxy(proxyFactory, "ProxyWalletRegistry");

  // calling setPrice to update price of collateral
  // const priceOracle = await artifacts.initializeInterfaceAt("PriceOracle", stablecoinAddress.priceOracle);
  // await priceOracle.setPrice(COLLATERAL_POOL_ID);

  await proxyWalletRegistry.build(deployerEOA)
  const proxyWalletapothemDeployerTest = await proxyWalletRegistry.proxies(deployerEOA);
  
  const proxyWalletAsDeployer = await artifacts.initializeInterfaceAt("ProxyWallet", proxyWalletapothemDeployerTest);
  const proxyWalletAsDeployerOwner = await proxyWalletAsDeployer.owner();
  console.log(deployerEOA == proxyWalletAsDeployerOwner);
                                                                                  //how much FXD to borrow
  await openPositionAndDraw(proxyWalletAsDeployer, COLLATERAL_POOL_ID, WeiPerWad.mul(parseInt(FXD,10)));
};