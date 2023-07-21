const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');

const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");


const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const SSMAddress = '0x40cddC07a9fB92019f7E60934d3c1C15Df451a56';
const SSMWrapperAddress = '0xe0f2b813b681575b1B84e5e7F2eb450b71E8d212';
const USDTx = '0x9dD4761Bd68169478a06156c0C1416fB9506BE78';
const FXD = '0xEd816e06cdb7B449bFa9fdB7A55d95A85A224Ecc';
const EOA = '0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3';
const TO_APPROVE_FXD = ethers.BigNumber.from('5000000000000000000');
const TO_APPROVE_USDT = ethers.BigNumber.from('5000000')

module.exports = async function(deployer) {

  const addresses = getAddresses(deployer.networkId())

  const stableSwapModule = await artifacts.initializeInterfaceAt("StableSwapModule", SSMAddress);
  const stableSwapWrapper = await artifacts.initializeInterfaceAt("StableSwapModuleWrapper", SSMWrapperAddress);

  const usdtX = await artifacts.initializeInterfaceAt("ERC20Mintable", USDTx);
  const fxd = await artifacts.initializeInterfaceAt("ERC20Mintable", FXD);

  const fathomStablecoin = await artifacts.initializeInterfaceAt("ERC20Mintable", FXD);
    //Generate random number between 1 WAD and 100 WAD to deposit 
    function getRandomNumber() {
        const min = ethers.BigNumber.from('1000000000000000000');
        const max = ethers.BigNumber.from('5000000000000000000');
        const range = max.sub(min);
      
        // Generate random bytes
        const randomBytes = ethers.utils.randomBytes(32);
        
        // Convert bytes to a BigNumber within the range
        const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
        
        return randomNumber;
      }
    
      function getRandomNumber2() {
        const min = ethers.BigNumber.from('1000000');
        const max = ethers.BigNumber.from('5000000');
        const range = max.sub(min);
      
        // Generate random bytes
        const randomBytes = ethers.utils.randomBytes(32);
        
        // Convert bytes to a BigNumber within the range
        const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
        
        return randomNumber;
      }
      
    const randomNumber = getRandomNumber();
    console.log(randomNumber.toString());

    const randomNumberToSwap0 = getRandomNumber2();
    const randomNumberToSwap1 = getRandomNumber();
    
    console.log("Approving FXD and USDTx");
    
    await fxd.approve(stableSwapModule.address, TO_APPROVE_FXD.toString());
    await usdtX.approve(stableSwapModule.address, TO_APPROVE_USDT.toString());
    
    //need to give a lot of tokens to EOA
    console.log("Swapping Token To Stablecoin");
    await stableSwapModule.swapTokenToStablecoin(accounts[0], randomNumberToSwap0.toString());
    console.log("Swapping Stablecoin To Token")
    await stableSwapModule.swapStablecoinToToken(accounts[0], randomNumberToSwap1.toString());

    const ActualLiquidityAvailablePerUser0PostSwap =  await stableSwapWrapper.getActualLiquidityAvailablePerUser(accounts[0]);
    
    const USDTxBalanceBeforeWithdrawalBeforeWithdrawalOfFees = await usdtX.balanceOf(accounts[0]);
    const FXDBalanceBeforeWithdrawalBeforeWithdrawalOfFees = await fxd.balanceOf(accounts[0]);
    
    console.log("Get Claimable Fees Per User")
    const claimableFees = await stableSwapWrapper.getClaimableFeesPerUser(accounts[0])
    
    console.log("Claim Fees Rewards")
    await stableSwapWrapper.claimFeesRewards();
    
    console.log("Withdraw Claimed Fees")
    await stableSwapWrapper.withdrawClaimedFees()

    const FXDBalancePostWithdrawalOfFees = await fxd.balanceOf(accounts[0]);
    const USDTxBalancePostWithdrawalOfFees = await usdtX.balanceOf(accounts[0]);
    
    const expectedFXDBalanceAfterWithdraw = FXDBalanceBeforeWithdrawalBeforeWithdrawalOfFees.add(claimableFees[0]);
    const expectedTokenBalanceAfterWithdraw = USDTxBalanceBeforeWithdrawalBeforeWithdrawalOfFees.add(claimableFees[1]);

    const correct1 = (expectedFXDBalanceAfterWithdraw.toString() == FXDBalancePostWithdrawalOfFees.toString());
    const correct2 = (expectedTokenBalanceAfterWithdraw.toString() == USDTxBalancePostWithdrawalOfFees.toString());

    console.log("actual fxd balance post withdrawal -> ",FXDBalancePostWithdrawalOfFees.toString());
    console.log("actual usdtx balance post withdrawal -> ",USDTxBalancePostWithdrawalOfFees.toString());
    
    
    console.log("expected FXD balance -> ",expectedFXDBalanceAfterWithdraw.toString())
    console.log("expected Token Balance -> ",expectedTokenBalanceAfterWithdraw.toString())

    console.log(correct1);
    console.log(correct2);

    const data = {
        depositAmount: randomNumber.toString(),
        ActualLiquidityAvailablePerUserFXDPostSwap : ActualLiquidityAvailablePerUser0PostSwap[0].toString(),
        ActualLiquidityAvailablePerUserUSDTPostSwap : ActualLiquidityAvailablePerUser0PostSwap[1].toString(),
        FXDBalanceBeforeWithdrawalBeforeWithdrawalOfFees : FXDBalanceBeforeWithdrawalBeforeWithdrawalOfFees.toString(),
        USDTxBalanceBeforeWithdrawalBeforeWithdrawalOfFees : USDTxBalanceBeforeWithdrawalBeforeWithdrawalOfFees.toString(),
        FXDBalancePostWithdrawalOfFees: FXDBalancePostWithdrawalOfFees.toString(),
        USDTxBalancePostWithdrawalOfFees:USDTxBalancePostWithdrawalOfFees.toString(),
        IsFXDValueAsExpectedPostWithdrawlOfFees : correct1,
        IsUSDTValueAsExpectedPostWithdrawlOfFees : correct2,
    };

    // Get the current date and time
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    // Construct the file name with year, date, and time
    const fileName = `randomNumber_${year}${month}${day}_${hours}${minutes}${seconds}.json`;

    // Convert the JSON object to a string
    const jsonData = JSON.stringify(data);

    // Write the JSON string to a file
    try {
        fs.writeFileSync(fileName, jsonData, 'utf8');
        console.log(`${fileName} has been saved!`);
      } catch (err) {
        console.error('Error writing file:', err);
      }


};