const fs = require('fs');
const path = require('path');

const BigNumber = require('bignumber.js');

const { ethers } = require("ethers");

const { getAddresses } = require("../common/addresses");

const { formatBytes32String } = require("ethers/lib/utils");

const COLLATERAL_POOL_ID = formatBytes32String("XDC");

const SSMAddress = '0x31A188FfEd12c7E2E6141E18a3b8A0e78E60249e';
const SSMWrapperAddress = '0x43c158A1119e7fbb9F2B2d13883c2744B494B496';
const USDTx = '0x9dD4761Bd68169478a06156c0C1416fB9506BE78';
const FXD = '0xEd816e06cdb7B449bFa9fdB7A55d95A85A224Ecc';
const EOA = '0xb8dC746eaba6a476240c8338ef64176F4317C264';


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
        const max = ethers.BigNumber.from('100000000000000000000');
        const range = max.sub(min);
      
        // Generate random bytes
        const randomBytes = ethers.utils.randomBytes(32);
        
        // Convert bytes to a BigNumber within the range
        const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
        
        return randomNumber;
      }
    
      function getRandomNumber2() {
        const min = ethers.BigNumber.from('1000000');
        const max = ethers.BigNumber.from('100000000');
        const range = max.sub(min);
      
        // Generate random bytes
        const randomBytes = ethers.utils.randomBytes(32);
        
        // Convert bytes to a BigNumber within the range
        const randomNumber = ethers.BigNumber.from(randomBytes).mod(range).add(min);
        
        return randomNumber;
      }
      
      const randomNumber = getRandomNumber();
      console.log(randomNumber.toString());

    await stableSwapWrapper.depositTokens(randomNumber.toString());
    const depositTrackerValue = await stableSwapWrapper.depositTracker(EOA);
    const correct0 = randomNumber.mul('2') == depositTrackerValue.toString()
    
    const ActualLiquidityAvailablePerUser0 =  await stableSwapWrapper.getActualLiquidityAvailablePerUser(EOA);

    const randomNumberToSwap0 = getRandomNumber2();
    const randomNumberToSwap1 = getRandomNumber();

    //need to give a lot of tokens to EOA
    await stableSwapModule.swapTokenToStablecoin(EOA, randomNumberToSwap0.toString());
    await stableSwapModule.swapStablecoinToToken(EOA, randomNumberToSwap1.toString());
    
    const USDTxBalanceBeforeWithdrawal = await usdtX.balanceOf(EOA);
    const FXDBalanceBeforeWithdrawal = await fxd.balanceOf(EOA);


    const ActualLiquidityAvailablePerUser1 =  await stableSwapWrapper.getActualLiquidityAvailablePerUser(EOA);

    const expectedFXDBalanceAfterWithdraw = ActualLiquidityAvailablePerUser1[0].add(FXDBalanceBeforeWithdrawal);
    const expectedUSDTBalanceAfterWithdraw = ActualLiquidityAvailablePerUser1[1].div(ethers.BigNumber.from('1000000000000')).add(USDTxBalanceBeforeWithdrawal);

    await stableSwapWrapper.withdrawTokens(depositTrackerValue.toString());

    const FXDBalancePostWithdrawal = await fxd.balanceOf(EOA);
    const USDTxBalancePostWithdrawal = await usdtX.balanceOf(EOA);

    const correct1 = (expectedFXDBalanceAfterWithdraw.toString() == FXDBalancePostWithdrawal.toString());
    const correct2 = (expectedUSDTBalanceAfterWithdraw.toString() == USDTxBalancePostWithdrawal.toString());

    console.log(expectedUSDTBalanceAfterWithdraw);
    console.log(USDTxBalancePostWithdrawal);


    console.log(correct1);
    console.log(correct2);


    const data = {
        depositAmount: randomNumber.toString(),
        depositTracker: depositTrackerValue.toString(),
        isDepositTrackerCorrect: correct0,
        ActualLiquidityAvailablePerUserFXD : ActualLiquidityAvailablePerUser0[0].toString(),
        ActualLiquidityAvailablePerUserUSDT : ActualLiquidityAvailablePerUser0[1].toString(),
        ActualLiquidityAvailablePerUserFXDPostSwap : ActualLiquidityAvailablePerUser1[0].toString(),
        ActualLiquidityAvailablePerUserUSDTPostSwap : ActualLiquidityAvailablePerUser1[1].toString(),
        FXDBalanceBeforeWithdrawal : FXDBalanceBeforeWithdrawal.toString(),
        USDTxBalanceBeforeWithdrawal : USDTxBalanceBeforeWithdrawal.toString(),
        IsFXDValueAsExpectedPostWithdrawl : correct1,
        IsUSDTValueAsExpectedPostWithdrawl : correct2,
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