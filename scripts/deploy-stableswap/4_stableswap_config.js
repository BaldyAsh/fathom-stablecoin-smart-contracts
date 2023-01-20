const { BigNumber } = require('ethers');

const { getProxy } = require("../common/proxies");
const { ethers } = require("ethers");
const { MaxUint256 } = require("@ethersproject/constants");

const { getAddresses } = require("../common/addresses");
const WeiPerWad = BigNumber.from(`1${"0".repeat(18)}`)

const SSM_FEE_IN = WeiPerWad.div(1000); 
const SSM_FEE_OUT = WeiPerWad.div(1000);
const T_TO_DEPOSIT = ethers.utils.parseEther("1000")
module.exports = async function (deployer) {
    const addresses = getAddresses(deployer.networkId())
    //TODO: Can I retrieve from externalAddress?

    //const USDAddress = addresses.USD
    //const fathomStablecoinAddress = addresses.fxd
    
    const USDAddress = "0x82b4334F5CD8385f55969BAE0A863a0C6eA9F63f"
    const fathomStablecoinAddress = "0x8909877Dc651f170Bd65d693AFA7e2B0091588BE"
    
    const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");
    
    const stableSwapModule = await getProxy(proxyFactory, "StableSwapModule");
    const USD = await artifacts.initializeInterfaceAt("ERC20Mintable", USDAddress);
    const fathomStablecoin = await artifacts.initializeInterfaceAt("ERC20Mintable", fathomStablecoinAddress);

    await USD.approve(stableSwapModule.address,MaxUint256, { gasLimit: 1000000 })
    await fathomStablecoin.approve(stableSwapModule.address,MaxUint256, { gasLimit: 1000000 })
    
    await stableSwapModule.setFeeIn(SSM_FEE_IN, { gasLimit: 1000000 })
    await stableSwapModule.setFeeOut(SSM_FEE_OUT, { gasLimit: 1000000 })

    await stableSwapModule.depositToken(USDAddress,T_TO_DEPOSIT,{ gasLimit: 1000000 })
    await stableSwapModule.depositToken(fathomStablecoinAddress,T_TO_DEPOSIT,{ gasLimit: 1000000 })
}