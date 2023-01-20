const fs = require('fs');

const { getProxy } = require("../common/proxies");
const { ethers } = require("ethers");
const { getAddresses } = require("../common/addresses");


module.exports = async function (deployer) {
    const addresses = getAddresses(deployer.networkId())
    //TODO: Can I retrieve from externalAddress?
    //TODO: Use the same proxy Factory
    //const USDAddress = addresses.USD
    //const fathomStablecoinAddress = addresses.fxd

    const bookKeeperAddress = "0xDe732bB4E19669b252F26c7Feb31296998321395"
    const USDAddress = "0x82b4334F5CD8385f55969BAE0A863a0C6eA9F63f"
    const fathomStablecoinAddress = "0x8909877Dc651f170Bd65d693AFA7e2B0091588BE"
    const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");

    const stableSwapModule = await getProxy(proxyFactory, "StableSwapModule");
    const dailyLimit = ethers.utils.parseUnits("10000", "ether");
    const promises = [
        stableSwapModule.initialize(
            bookKeeperAddress,
            USDAddress,
            fathomStablecoinAddress,
            dailyLimit,
            { gasLimit: 1000000 }
        )
    ];

    await Promise.all(promises);

    const newAddresses = {
        proxyFactory: proxyFactory.address,
        stableSwapModule: stableSwapModule.address,
    }

    fs.writeFileSync('./addresses-stableswap.json', JSON.stringify(newAddresses));
}