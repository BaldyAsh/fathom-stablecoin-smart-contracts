const fs = require('fs');
const { BigNumber, ethers } = require('ethers');
// require('ethers');

const UniswapV2FactoryArtifact = require("into-the-fathom-swap-smart-contracts/artifacts/contracts/core/UniswapV2Factory.sol/UniswapV2Factory.json");
const UniswapV2Router02Artifact = require("into-the-fathom-swap-smart-contracts/artifacts/contracts/periphery/UniswapV2Router02.sol/UniswapV2Router02.json");

const rawdata = fs.readFileSync('../../../../externalAddresses.json');
let addresses = JSON.parse(rawdata);

const MockedDexRouter = artifacts.require('MockedDexRouter.sol');
const TokenAdapter = artifacts.require('TokenAdapter.sol');
const FathomToken = artifacts.require('FathomToken.sol');
const ERC20 = artifacts.require('ERC20Mintable.sol');
const WXDC = artifacts.require('WXDC.sol');
const ERC20Stable = artifacts.require('ERC20MintableStableSwap.sol')
const SimplePriceFeed = artifacts.require('SimplePriceFeed.sol')
module.exports =  async function(deployer) {
  const promises = [
      deployer.deploy(ERC20, "US+", "US+", { gas: 3050000 }),
      deployer.deploy(MockedDexRouter, { gas: 3050000 }),
      deployer.deploy(TokenAdapter, { gas: 3050000 }),
      deployer.deploy(FathomToken, 88, 89, { gas: 3050000 }),
      deployer.deploy(ERC20Stable,"StableCoin","SFC",{gas: 3050000}),
      deployer.deploy(SimplePriceFeed, { gas: 7050000 }),
  ];


  await Promise.all(promises);

  const chainId = deployer.networkId(ERC20.address);
  addresses[chainId].USD = ERC20.address;

  await deployer.deploy(WXDC, { gas: 3050000 }),
  addresses[chainId].WXDC = WXDC.address;

  // const UniswapV2Factory = await ethers.getContractFactory(
  //   UniswapV2FactoryArtifact.abi,
  //   UniswapV2FactoryArtifact.bytecode
  // );
  // console.log(UniswapV2FactoryArtifact)
  // const uniswapV2Factory = await deployer.deployContract(UniswapV2FactoryArtifact, "0x4C5F0f90a2D4b518aFba11E22AC9b8F6B031d204", { gas: 3050000 });
  // console.log("UniswapV2Factory deployed to:", uniswapV2Factory.address);

  fs.writeFileSync('./externalAddresses.json', JSON.stringify(addresses));
};