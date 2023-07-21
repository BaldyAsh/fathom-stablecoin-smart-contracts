const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');

const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");


const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const SSMWrapperAddress = '0xe0f2b813b681575b1B84e5e7F2eb450b71E8d212';

module.exports = async function(deployer) {

    const addresses = getAddresses(deployer.networkId())
    const stableSwapWrapper = await artifacts.initializeInterfaceAt("StableSwapModuleWrapper", SSMWrapperAddress);
    
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xE82C380C6Ca0306C61454569e84e020d68B063EF', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0x2B3691065A78F5fb02E9BF54A197b95da2B26AF7', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xFa869165D4fB9DB1041eBc3E8D976847372FcF91', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xd32Cd592c5296e893AfF7eb8518977A67e4b6741', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0xFE5247d790913A779CB3B24D7CD3da72e974a3D4', { gasLimit: 1000000 })
    console.log("Adding to whitelist -1");
    await stableSwapWrapper.addToWhitelist('0x6f342136EeafaEAF1b6056597f58060438946674', { gasLimit: 1000000 })
 
}