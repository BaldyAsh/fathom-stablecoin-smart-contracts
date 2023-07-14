const { ethers } = require("ethers");
const { getProxy, getProxyById } = require("../common/proxies");

module.exports = async function (deployer) {
    //I need showStopper
    //I need proxyWallet address
    const proxyWalletDevDeployer = "0x2c75af9aBA3CaCc016581Ced33a948199f4fD4b4";
    const devDeployerAddress = "0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3";
    const positionsToRedeemLockedCollateral = [3, 7, 8, 10, 11, 13, 14, 15];

    const proxyWallet = await artifacts.initializeInterfaceAt("ProxyWallet", proxyWalletDevDeployer);

    const redeemLockedCollateral = async (proxyWallet, from, positionId) => {
        const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "0x168b8b44abB8d3Fe59FF7DeDa069F7b87Eaf3896");
        const positionManager = await getProxy(proxyFactory, "PositionManager");

        const abi = [
            "function redeemLockedCollateral(address _manager, uint256 _positionId, bytes calldata _data)"
        ];
        const interface = new ethers.utils.Interface(abi);
        const call = interface.encodeFunctionData("redeemLockedCollateral", [
            '0x57387A3bf9f43632bc61562E1aF5685999F94d8e', // positionmanager address
            positionId,
            "0x"
        ]);
        console.log(positionId + "  " + call)
        // await proxyWallet.execute(call, { from: from });
    }

    for (const positionId of positionsToRedeemLockedCollateral) {
        await redeemLockedCollateral(proxyWallet, devDeployerAddress, positionId);
    }
}
