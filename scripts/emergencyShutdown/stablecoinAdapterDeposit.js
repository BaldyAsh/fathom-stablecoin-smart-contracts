const { ethers } = require("ethers");
const { getProxy, getProxyById } = require("../common/proxies");

const { BigNumber } = require("ethers");

const WeiPerWad = BigNumber.from(`1${"0".repeat(18)}`)

module.exports = async function (deployer) {

    const stablecoinAdapterDepositCalldata = async () => {
        const abi = [
            "function stablecoinAdapterDeposit(address _adapter, address _positionAddress, uint256 _stablecoinAmount, bytes calldata _data)"
        ];
        const interface = new ethers.utils.Interface(abi);
        const call = interface.encodeFunctionData("stablecoinAdapterDeposit", [
            '0x1DFa576240630c79826103F64D4f13787B06e790', // stablecoin _adapter address
            '0x06270Cc463cAF83aC84b96CeF35DA80cc3F06aE4', // _positionAddress .. but in my case, it should be systemDebtEngine
            WeiPerWad.mul(207000),        // _stablecoinAmount
            "0x" 
        ]);
        console.log(call)
        // await proxyWallet.execute(call, { from: from });
    }
    await stablecoinAdapterDepositCalldata();

}
