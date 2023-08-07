// const fs = require('fs');
// const rawdata = fs.readFileSync('../../addresses.json');
// let stablecoinAddress = JSON.parse(rawdata);
const { ethers } = require("ethers");

const emergencyWithdraw = async () => {

  //     function emergencyWithdraw(address _adapter, address _to) external onlyDelegateCall {

  console.log("here1");

  const emergencyWithdrawAbi = [
      "function emergencyWithdraw(address _adapter, address _to)"
  ];
  const emergencyWithdrawIFace = new ethers.utils.Interface(emergencyWithdrawAbi);
  const emergencyWithdraw = emergencyWithdrawIFace.encodeFunctionData("emergencyWithdraw", [
      "0x066c87701CeDA5741e26d4E722792B44CC6A17a6", //CollateralTokenAdapter
      "0x9a337088801B30a3eB715937BCDE27A34BC62841"//_to
  ])
  console.log("below is the encoded data");
  console.log(emergencyWithdraw);
  console.log("here2");
}

module.exports = async function(deployer) {
  await emergencyWithdraw();
};