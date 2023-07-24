const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');

const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");


const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const SSMWrapperAddress = '0xdF0525B9B1b8ED1Db70a238Babf723aF2C3A5378';

module.exports = async function(deployer) {

    const addresses = getAddresses(deployer.networkId())
    const stableSwapWrapper = await artifacts.initializeInterfaceAt("StableSwapModuleWrapper", SSMWrapperAddress);
    
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xE82C380C6Ca0306C61454569e84e020d68B063EF', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0x2B3691065A78F5fb02E9BF54A197b95da2B26AF7', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xFa869165D4fB9DB1041eBc3E8D976847372FcF91', { gasLimit: 1000000 })
}