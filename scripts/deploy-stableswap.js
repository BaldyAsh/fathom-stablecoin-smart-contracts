const StableSwapModule = artifacts.require('StableSwapModule.sol');
const ProxyAdmin = artifacts.require('FathomProxyAdmin.sol');
const { formatBytes32String } = require("ethers/lib/utils");
const { getProxy } = require("./common/proxies");
const FathomProxyFactory = artifacts.require('FathomProxyFactory.sol');
const StableSwapModuleWrapper = artifacts.require('StableSwapModuleWrapper.sol');

module.exports = async function(deployer) {
    let promises = [
        deployer.deploy(FathomProxyFactory, {gas: 7050000}),
        deployer.deploy(ProxyAdmin, {gas: 7050000}),
        deployer.deploy(StableSwapModule, {gas: 7050000}),
        deployer.deploy(StableSwapModuleWrapper, {gas: 7050000}),
    ]



    await Promise.all(promises)
    const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");
    const proxyAdmin = await artifacts.initializeInterfaceAt("FathomProxyAdmin", "FathomProxyAdmin");
    

    const contracts = [
        "StableSwapModule",
        "StableSwapModuleWrapper"
    ]

    const promisesProxies = contracts.map(contract => {
        const instance = artifacts.require(contract + ".sol");
        return proxyFactory.createProxy(formatBytes32String(contract), instance.address, proxyAdmin.address, "0x", { gasLimit: 2000000 })
    });

    await Promise.all(promisesProxies);
    const stableSwapModuleWrapper = await getProxy(proxyFactory,"StableSwapModuleWrapper")
    const stableSwapModule = await getProxy(proxyFactory,"StableSwapModule")
    
    const BookKeeperAddress = "0x7F888b7e699E9e1248ddc3f39b39b4C10A0fD006"
    const USDAddress = "0x9dD4761Bd68169478a06156c0C1416fB9506BE78"
    const fathomStablecoinAddress = "0xEd816e06cdb7B449bFa9fdB7A55d95A85A224Ecc"
    const dailyLimitNumerator = 2000//on denomination of 10000th, 2000/10000 = 20%
    const singleSwapLimitNumerator = 100 ///on denomination of 10000th, 100/10000 = 1%
    const numberOfSwapsLimitPerUser = 1; // number of swaps per user per limit period
    const blocksPerLimit = 2; // blocks per limit period

    

    await stableSwapModule.initialize(
        BookKeeperAddress,
        USDAddress,
        fathomStablecoinAddress,
        dailyLimitNumerator,
        singleSwapLimitNumerator,
        numberOfSwapsLimitPerUser,
        blocksPerLimit,
        { gasLimit: 1000000 }
    )

    await stableSwapModuleWrapper.initialize(
        BookKeeperAddress,
        stableSwapModule.address,
        { gasLimit: 1000000 }
    )
    
    console.log("stableswapWrapper Address -->", stableSwapModuleWrapper.address)
    console.log("proxy Admin address ->", proxyAdmin.address)
    console.log("proxy factory address ->", proxyFactory.address)
    console.log("StableSwapModule  Address -> ", stableSwapModule.address)
}



