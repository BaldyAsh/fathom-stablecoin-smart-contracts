const chai = require('chai');
const { BigNumber, ethers } = require("ethers");
const { MaxUint256 } = require("@ethersproject/constants");
const TimeHelpers = require("../helper/time");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { WeiPerRad, WeiPerRay, WeiPerWad } = require("../helper/unit");
const { DeployerAddress, AddressZero } = require("../helper/address");
const { formatBytes32String } = require("ethers/lib/utils");
const { loadFixture } = require("../helper/fixtures");
const { getProxy } = require("../../common/proxies");

const { expect } = chai

const COLLATERAL_POOL_ID = formatBytes32String("USDT-COL")

const CLOSE_FACTOR_BPS = BigNumber.from(5000)
const LIQUIDATOR_INCENTIVE_BPS = BigNumber.from(12500)
const TREASURY_FEE_BPS = BigNumber.from(2500)

const ERC20Stable = artifacts.require('ERC20MintableStable.sol')


const setup = async () => {
    const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");

    const collateralTokenAdapterFactory = await getProxy(proxyFactory, "CollateralTokenAdapterFactory");
    const collateralPoolConfig = await getProxy(proxyFactory, "CollateralPoolConfig");
    const bookKeeper = await getProxy(proxyFactory, "BookKeeper");
    const simplePriceFeed = await getProxy(proxyFactory, "SimplePriceFeed");
    const systemDebtEngine = await getProxy(proxyFactory, "SystemDebtEngine");
    const stablecoinAdapter = await getProxy(proxyFactory, "StablecoinAdapter");
    const stableSwapModule = await getProxy(proxyFactory, "StableSwapModule");
    const authTokenAdapter = await getProxy(proxyFactory, "AuthTokenAdapter");
    const flashMintModule = await getProxy(proxyFactory, "FlashMintModule");
    const fathomStablecoin = await getProxy(proxyFactory, "FathomStablecoin");

    const collateralTokenAdapterAddress = await collateralTokenAdapterFactory.adapters(COLLATERAL_POOL_ID)
    const collateralTokenAdapter = await artifacts.initializeInterfaceAt("CollateralTokenAdapter", collateralTokenAdapterAddress);

    const stablecoin = await artifacts.initializeInterfaceAt("ERC20MintableStable", "ERC20MintableStable");
    await stablecoin.mint(accounts[0], BigNumber.from("10000000000000000000000000000"), { gasLimit: 1000000 })
    const usdtAddr = await collateralTokenAdapter.collateralToken();
    const USDT = await artifacts.initializeInterfaceAt("ERC20Mintable", usdtAddr);
    await collateralPoolConfig.initCollateralPool(
        COLLATERAL_POOL_ID,
        WeiPerRad.mul(100000000000000),
        0,
        simplePriceFeed.address,
        WeiPerRay,
        WeiPerRay,
        authTokenAdapter.address,
        CLOSE_FACTOR_BPS,
        LIQUIDATOR_INCENTIVE_BPS,
        TREASURY_FEE_BPS,
        AddressZero
    )

    await bookKeeper.setTotalDebtCeiling(WeiPerRad.mul(100000000000000), { gasLimit: 1000000 })
    
    await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay, { gasLimit: 1000000 })
    // Deploy Fathom Stablecoin
    await bookKeeper.whitelist(stablecoinAdapter.address, { gasLimit: 1000000 })
    await stableSwapModule.setFeeIn(ethers.utils.parseEther("0.001"), { gasLimit: 1000000 })
    await stableSwapModule.setFeeOut(ethers.utils.parseEther("0.001"), { gasLimit: 1000000 })
    await authTokenAdapter.grantRole(await authTokenAdapter.WHITELISTED(), stableSwapModule.address, { gasLimit: 1000000 })
    await flashMintModule.setMax(ethers.utils.parseEther("100000000"), { gasLimit: 1000000 })
    await flashMintModule.setFeeRate(ethers.utils.parseEther("25").div(10000), { gasLimit: 1000000 })
    //accounts[0] setup
    await USDT.mint(accounts[0], ethers.utils.parseEther("1000000"), { gasLimit: 1000000 })
    await USDT.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000 })
    await stablecoin.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000 })
    await stableSwapModule.depositToken(USDT.address,ethers.utils.parseEther("100000"),{ gasLimit: 1000000 })
    await stableSwapModule.depositToken(stablecoin.address,ethers.utils.parseEther("100000"),{ gasLimit: 1000000 })

    
    return {
        bookKeeper,
        stablecoinAdapter,
        collateralPoolConfig,
        USDT,
        stableSwapModule,
        authTokenAdapter,
        fathomStablecoin,
        systemDebtEngine,
        stablecoin
    }
}

describe("StableSwapModule", () => {
    // Contracts
    let stablecoinAdapter
    let bookKeeper
    let USDT
    let stableSwapModule
    let authTokenAdapter
    let fathomStablecoin
    let systemDebtEngine
    let collateralPoolConfig
    let stablecoin

    before(async () => {
        await snapshot.revertToSnapshot();
    })

    beforeEach(async () => {
        ({
            bookKeeper,
            stablecoinAdapter,
            collateralPoolConfig,
            USDT,
            stableSwapModule,
            authTokenAdapter,
            fathomStablecoin,
            systemDebtEngine,
            stablecoin
        } = await loadFixture(setup));
    })

    describe("#swapTokenToStablecoin", async () => {
        
        context("swap USDT to FXD", async () => {
            it("should success", async () => {
                console.log(await fathomStablecoin.balanceOf(accounts[0]))
                //accounts[5] setup
                await USDT.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000, from : accounts[5] })
                await stablecoin.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000, from: accounts[5] })
                await USDT.mint(accounts[5], ethers.utils.parseEther("10000"), { gasLimit: 1000000 })
                await stablecoin.mint(accounts[5], ethers.utils.parseEther("10000"), { gasLimit: 1000000 })
                
                await stableSwapModule.swapTokenToStablecoin(accounts[5],ethers.utils.parseEther("1000"), { gasLimit: 1000000, from: accounts[5] })
                const balanceOfStablecoin = await stablecoin.balanceOf(accounts[5])
                const balanceOfUSDT = await USDT.balanceOf(accounts[5])
                //10000 -> initial balance, 1000 -> from swap, -ve 1 -> from fee. Total balance = 10000+1000-1 = 10999
                expect(balanceOfStablecoin).to.be.equal(ethers.utils.parseEther("10999"))
                //10000 -> initial balance, -ve 1000 -> from swap. Total Balance = 10000 - 1000 = 9000
                expect(balanceOfUSDT).to.be.equal(ethers.utils.parseEther("9000"))
            })
        })
    })

    describe("#swapStablecoinToToken", async () => {
        context("collateral not enough", async () => {
            it("should SWAP", async () => {
                 //accounts[5] setup
                await USDT.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000, from : accounts[5] })
                await stablecoin.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000, from: accounts[5] })
                await USDT.mint(accounts[5], ethers.utils.parseEther("10000"), { gasLimit: 1000000 })
                await stablecoin.mint(accounts[5], ethers.utils.parseEther("10000"), { gasLimit: 1000000 })

                await stableSwapModule.swapStablecoinToToken(accounts[5],ethers.utils.parseEther("1000"), { gasLimit: 1000000, from: accounts[5] })
                const balanceOfStablecoin = await stablecoin.balanceOf(accounts[5])
                const balanceOfUSDT = await USDT.balanceOf(accounts[5])
                ///10000 -> initial balance, -ve 1000 -> from swap, -ve 1 -> from fee. Total balance = 10000 - 1000 - 1 = 8999
                expect(balanceOfStablecoin).to.be.equal(ethers.utils.parseEther("8999"))
                ///10000 -> initial balance, 1000 -> from swap Total balance = 10000+1000 = 11000
                expect(balanceOfUSDT).to.be.equal(ethers.utils.parseEther("11000"))
            })
        })

        context("swap FXD to USDT", async () => {
            it("should success", async () => {
                // Mint 1000 USDT to deployer
                await stableSwapModule.swapTokenToStablecoin(DeployerAddress, ethers.utils.parseEther("1000"), { gasLimit: 1000000 })
                // Swap 998 FXD to USDT
                await fathomStablecoin.approve(stableSwapModule.address, MaxUint256, { gasLimit: 1000000 })
                await stableSwapModule.swapStablecoinToToken(DeployerAddress,ethers.utils.parseEther("998"), { gasLimit: 1000000 })

                // first swap = 1000 * 0.001 = 1 FXD
                // second swap = 998 * 0.001 = 0.998 FXD
                // total fee = 1 + 0.998 = 1.998
                await stableSwapModule.withdrawFees(accounts[2]);
                const feeFromSwap = await stablecoin.balanceOf(accounts[2])
                expect(feeFromSwap).to.be.equal(ethers.utils.parseEther("1.998"))
            })
        })
    })

    describe("#dailyLimitCheck", async () => {
        context("check for daily limit", async() => {
            it("Should be swap tokens and generate fees with check on daily limit", async() => {
                //first swap which takes all the allowance
                await stableSwapModule.swapTokenToStablecoin(DeployerAddress,ethers.utils.parseEther("10000"), { gasLimit: 1000000 })
                //revert because it exceed allowance
                await expect(stableSwapModule.swapTokenToStablecoin(DeployerAddress,ethers.utils.parseEther("100"), { gasLimit: 1000000 })
                ).to.be.revertedWith("_udpateAndCheckDailyLimit/daily-limit-exceeded")
                await expect(stableSwapModule.swapStablecoinToToken(DeployerAddress,ethers.utils.parseEther("100"), { gasLimit: 1000000 })
                ).to.be.revertedWith("_udpateAndCheckDailyLimit/daily-limit-exceeded")

                const ONE_DAY = 86400
                await TimeHelpers.increase(ONE_DAY+20)
                //again swap after increasing timestamp
                //should succeed
                await stableSwapModule.swapStablecoinToToken(DeployerAddress,ethers.utils.parseEther("5000"), { gasLimit: 1000000 })
                await stableSwapModule.swapStablecoinToToken(DeployerAddress,ethers.utils.parseEther("5000"), { gasLimit: 1000000 })
                await expect(stableSwapModule.swapTokenToStablecoin(DeployerAddress,ethers.utils.parseEther("1"), { gasLimit: 1000000 })
                ).to.be.revertedWith("_udpateAndCheckDailyLimit/daily-limit-exceeded")
                
                //first swap = 10000 * 0.001 = 10
                //second swap = 5000 * 0.001 = 5
                //third swap = 5000 * 0.001 = 5
                // fee = 10 + 5 + 5 = 20
                await stableSwapModule.withdrawFees(accounts[2]);
                const feeFromSwap = await stablecoin.balanceOf(accounts[2])
                expect(feeFromSwap).to.be.equal(ethers.utils.parseEther("20"))
            })
        })
        
    })
})
