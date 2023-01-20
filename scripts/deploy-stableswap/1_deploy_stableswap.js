const StableSwapModule = artifacts.require('StableSwapModule.sol');
const FathomProxyFactory = artifacts.require('FathomProxyFactory.sol');
const FathomProxyAdmin = artifacts.require('FathomProxyAdmin.sol');

module.exports =  async function(deployer) {
    let promises = [
        deployer.deploy(FathomProxyFactory, { gas: 7050000 }),
        deployer.deploy(FathomProxyAdmin, { gas: 7050000 }),
        deployer.deploy(StableSwapModule, { gas: 7050000 }),
    ];

    await Promise.all(promises);
};
