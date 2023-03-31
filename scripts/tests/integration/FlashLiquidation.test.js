const chai = require('chai');
const { ethers, BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");

const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai

const { WeiPerRay } = require("../helper/unit");
const { loadFixture } = require("../helper/fixtures");
const { getProxy } = require("../../common/proxies");

const { formatBytes32String } = ethers.utils
const FOREVER = "2000000000"


const ALPACA_PER_BLOCK = ethers.utils.parseEther("100")
const COLLATERAL_POOL_ID = formatBytes32String("dummyToken")
const WBNB_COLLATERAL_POOL_ID = formatBytes32String("ibWBNB")
const IBBUSD_COLLATERAL_POOL_ID = formatBytes32String("ibBUSD")
const BUSD_COLLATERAL_POOL_ID = formatBytes32String("BUSD-StableSwap")
const CLOSE_FACTOR_BPS = BigNumber.from(5000)
const LIQUIDATOR_INCENTIVE_BPS = BigNumber.from(10250)
const TREASURY_FEE_BPS = BigNumber.from(5000)
const BPS = BigNumber.from(10000)

const loadFixtureHandler = async () => {
  console.log("28")
  const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");
  const simplePriceFeed = await artifacts.initializeInterfaceAt("SimplePriceFeed", "SimplePriceFeed");

  const bookKeeper = await getProxy(proxyFactory, "BookKeeper");
  const collateralPoolConfig = await getProxy(proxyFactory, "CollateralPoolConfig");


  // Deploy mocked BEP20
  // const BEP20 = (await ethers.getContractFactory("BEP20", deployer)) as BEP20__factory
  // const dummyToken = await BEP20.deploy("dummyToken", "dummyToken")
  // await dummyToken.deployed()
  // await dummyToken.mint(await alice.getAddress(), ethers.utils.parseEther("1000000"))
  // await dummyToken.mint(await bob.getAddress(), ethers.utils.parseEther("100"))

  // const BUSD = await BEP20.deploy("BUSD", "BUSD")
  // await BUSD.deployed()
  // await BUSD.mint(await alice.getAddress(), ethers.utils.parseEther("1000000"))

  // const ibBUSD = await BEP20.deploy("ibBUSD", "ibBUSD")
  // await ibBUSD.deployed()

  // Deploy Alpaca's Fairlaunch
  // const AlpacaToken = (await ethers.getContractFactory("AlpacaToken", deployer)) as AlpacaToken__factory
  // const alpacaToken = await AlpacaToken.deploy(88, 89)
  // await alpacaToken.mint(await deployer.getAddress(), ethers.utils.parseEther("150"))
  // await alpacaToken.deployed()

  // const WBNB = new WETH__factory(deployer)
  // const wbnb = await WBNB.deploy()
  // await wbnb.deployed()

  // const WNativeRelayer = new WNativeRelayer__factory(deployer)
  // const wNativeRelayer = (await WNativeRelayer.deploy(wbnb.address)) as WNativeRelayer
  // await wNativeRelayer.deployed()

  // const DebtToken = new DebtToken__factory(deployer)
  // const debtToken = await DebtToken.deploy()
  // await debtToken.deployed()
  // await debtToken.initialize("debtibBTOKEN_V2", "debtibBTOKEN_V2", deployer.address)

  // const FairLaunch = (await ethers.getContractFactory("FairLaunch", deployer)) as FairLaunch__factory
  // const fairLaunch = await FairLaunch.deploy(alpacaToken.address, await dev.getAddress(), ALPACA_PER_BLOCK, 0, 0, 0)
  // await fairLaunch.deployed()

  // const Shield = (await ethers.getContractFactory("Shield", deployer)) as Shield__factory
  // const shield = await Shield.deploy(deployer.address, fairLaunch.address)
  // await shield.deployed()

  // const RESERVE_POOL_BPS = "1000" // 10% reserve pool
  // const KILL_PRIZE_BPS = "1000" // 10% Kill prize
  // const INTEREST_RATE = "3472222222222" // 30% per year
  // const MIN_DEBT_SIZE = ethers.utils.parseEther("1") // 1 BTOKEN min debt size
  // const KILL_TREASURY_BPS = "100"

  // const SimpleVaultConfig = new SimpleVaultConfig__factory(deployer)
  // const simpleVaultConfig = await SimpleVaultConfig.deploy()
  // await simpleVaultConfig.deployed()
  // await simpleVaultConfig.initialize(
  //   MIN_DEBT_SIZE,
  //   INTEREST_RATE,
  //   RESERVE_POOL_BPS,
  //   KILL_PRIZE_BPS,
  //   wbnb.address,
  //   wNativeRelayer.address,
  //   fairLaunch.address,
  //   KILL_TREASURY_BPS,
  //   deployer.address
  // )

  // const Vault = new Vault__factory(deployer)
  // // const tokenVault = await Vault.deploy()
  // // await tokenVault.deployed()
  // // await tokenVault.initialize(
  // //   simpleVaultConfig.address,
  // //   baseToken.address,
  // //   "Interest Bearing BTOKEN",
  // //   "ibBTOKEN",
  // //   18,
  // //   debtToken.address
  // // )

  // const ibBUSDVault = await Vault.deploy()
  // await ibBUSDVault.deployed()
  // await ibBUSDVault.initialize(
  //   simpleVaultConfig.address,
  //   BUSD.address,
  //   "Interest Bearing BUSD",
  //   "ibBUSD",
  //   18,
  //   debtToken.address
  // )

  // const bnbVault = await Vault.deploy()
  // await bnbVault.deployed()
  // await bnbVault.initialize(
  //   simpleVaultConfig.address,
  //   wbnb.address,
  //   "Interest Bearing BNB",
  //   "ibBNB",
  //   18,
  //   debtToken.address
  // )

  // await wNativeRelayer.setCallerOk([bnbVault.address], true)

  // // Config Alpaca's FairLaunch
  // // Assuming Deployer is timelock for easy testing
  // await fairLaunch.addPool(1, dummyToken.address, true)
  // await fairLaunch.addPool(1, bnbVault.address, true)
  // await fairLaunch.addPool(1, ibBUSDVault.address, true)
  // await fairLaunch.transferOwnership(shield.address)
  // await shield.transferOwnership(await deployer.getAddress())
  // await alpacaToken.transferOwnership(fairLaunch.address)

  // Deploy PositionManager
  const positionManager = await getProxy(proxyFactory, "PositionManager");


  // const IbTokenAdapter = (await ethers.getContractFactory("IbTokenAdapter", deployer)) as IbTokenAdapter__factory
  // const ibTokenAdapter = (await upgrades.deployProxy(IbTokenAdapter, [
  //   bookKeeper.address,
  //   COLLATERAL_POOL_ID,
  //   dummyToken.address,
  //   alpacaToken.address,
  //   fairLaunch.address,
  //   0,
  //   shield.address,
  //   await deployer.getAddress(),
  //   BigNumber.from(1000),
  //   await dev.getAddress(),
  //   positionManager.address,
  // ])) as IbTokenAdapter
  // await ibTokenAdapter.deployed()



  // const ibWBNBAdapter = (await upgrades.deployProxy(IbTokenAdapter, [
  //   bookKeeper.address,
  //   WBNB_COLLATERAL_POOL_ID,
  //   bnbVault.address,
  //   alpacaToken.address,
  //   fairLaunch.address,
  //   1,
  //   shield.address,
  //   await deployer.getAddress(),
  //   BigNumber.from(1000),
  //   await dev.getAddress(),
  //   positionManager.address,
  // ])) as IbTokenAdapter
  // await ibTokenAdapter.deployed()

  // const ibBUSDAdapter = (await upgrades.deployProxy(IbTokenAdapter, [
  //   bookKeeper.address,
  //   IBBUSD_COLLATERAL_POOL_ID,
  //   ibBUSDVault.address,
  //   alpacaToken.address,
  //   fairLaunch.address,
  //   2,
  //   shield.address,
  //   await deployer.getAddress(),
  //   BigNumber.from(1000),
  //   await dev.getAddress(),
  //   positionManager.address,
  // ])) as IbTokenAdapter
  // await ibTokenAdapter.deployed()


  // await bookKeeper.setTotalDebtCeiling(WeiPerRad.mul(10000000))

  // await accessControlConfig.grantRole(await accessControlConfig.PRICE_ORACLE_ROLE(), deployer.address)
  // await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay)

  // await accessControlConfig.grantRole(
  //   ethers.utils.solidityKeccak256(["string"], ["ADAPTER_ROLE"]),
  //   ibTokenAdapter.address
  // )
  // await accessControlConfig.grantRole(
  //   ethers.utils.solidityKeccak256(["string"], ["ADAPTER_ROLE"]),
  //   ibWBNBAdapter.address
  // )
  // await accessControlConfig.grantRole(
  //   ethers.utils.solidityKeccak256(["string"], ["ADAPTER_ROLE"]),
  //   ibBUSDAdapter.address
  // )
  // await accessControlConfig.grantRole(await accessControlConfig.MINTABLE_ROLE(), deployer.address)

  // Deploy Alpaca Stablecoin
  const fathomStablecoin = await getProxy(proxyFactory, "FathomStablecoin");

  const stablecoinAdapter = await getProxy(proxyFactory, "StablecoinAdapter");


  const fathomStablecoinProxyActions = await artifacts.initializeInterfaceAt("FathomStablecoinProxyActions", "FathomStablecoinProxyActions");

  const systemDebtEngine = await artifacts.initializeInterfaceAt("SystemDebtEngine", "SystemDebtEngine");


  const stabilityFeeCollector = await getProxy(proxyFactory, "StabilityFeeCollector");

  const liquidationEngine = await getProxy(proxyFactory, "LiquidationEngine");


  const priceOracle = await getProxy(proxyFactory, "PriceOracle");


  const fixedSpreadLiquidationStrategy = await getProxy(proxyFactory, "FixedSpreadLiquidationStrategy");

  const MockFlashLendingCalleeMintable = await getProxy(proxyFactory, "MockFlashLendingCalleeMintable");



  // const MockFlashLendingCalleeMintable = (await ethers.getContractFactory(
  //   "MockFlashLendingCalleeMintable",
  //   deployer
  // )) as MockFlashLendingCalleeMintable__factory
  // const mockFlashLendingCalleeMintable = (await upgrades.deployProxy(MockFlashLendingCalleeMintable, [
  //   bookKeeper.address,
  // ])) as MockFlashLendingCalleeMintable
  // await accessControlConfig.grantRole(await accessControlConfig.MINTABLE_ROLE(), mockFlashLendingCalleeMintable.address)
  // await accessControlConfig.grantRole(
  //   await accessControlConfig.COLLATERAL_MANAGER_ROLE(),
  //   mockFlashLendingCalleeMintable.address
  // )

  const MockFlashLendingCallee = await getProxy(proxyFactory, "MockFlashLendingCallee");


  // const MockFlashLendingCallee = (await ethers.getContractFactory(
  //   "MockFlashLendingCallee",
  //   deployer
  // )) as MockFlashLendingCallee__factory
  // const mockFlashLendingCallee = (await upgrades.deployProxy(MockFlashLendingCallee, [])) as MockFlashLendingCallee

  // Setup Pancakeswap
  // const PancakeFactoryV2 = new PancakeFactory__factory(deployer)
  // const factoryV2 = await PancakeFactoryV2.deploy(await deployer.getAddress())
  // await factoryV2.deployed()

  // const PancakeRouterV2 = new PancakeRouterV2__factory(deployer)
  // const routerV2 = await PancakeRouterV2.deploy(factoryV2.address, wbnb.address)
  // await routerV2.deployed()

  // /// Setup BUSD-AUSD pair on Pancakeswap
  // await factoryV2.createPair(dummyToken.address, BUSD.address)
  // await factoryV2.createPair(BUSD.address, alpacaStablecoin.address)
  // await factoryV2.createPair(wbnb.address, alpacaStablecoin.address)
  // const lpV2 = PancakePair__factory.connect(await factoryV2.getPair(dummyToken.address, BUSD.address), deployer)
  // await lpV2.deployed()

  const FlashLiquidator = await getProxy(proxyFactory, "FlashLiquidator");



  // Deploy AuthTokenAdapter
  const authTokenAdapter = await getProxy(proxyFactory, "AuthTokenAdapter");

  // await collateralPoolConfig.initCollateralPool(
  //   BUSD_COLLATERAL_POOL_ID,
  //   WeiPerRad.mul(10000000),
  //   0,
  //   simplePriceFeed.address,
  //   WeiPerRay,
  //   WeiPerRay,
  //   authTokenAdapter.address,
  //   CLOSE_FACTOR_BPS,
  //   LIQUIDATOR_INCENTIVE_BPS,
  //   TREASURY_FEE_BPS,
  //   AddressZero
  // )
  // await collateralPoolConfig.setPriceWithSafetyMargin(BUSD_COLLATERAL_POOL_ID, WeiPerRay)

  
  // Deploy StableSwapModule
  const stableSwapModule = await getProxy(proxyFactory, "StableSwapModule");
  console.log("29")

  // const StableSwapModule = (await ethers.getContractFactory("StableSwapModule", deployer)) as StableSwapModule__factory
  // const stableSwapModule = (await upgrades.deployProxy(StableSwapModule, [
  //   authTokenAdapter.address,
  //   stablecoinAdapter.address,
  //   systemDebtEngine.address,
  // ])) as StableSwapModule
  // await stableSwapModule.deployed()
  // await stableSwapModule.setFeeIn(ethers.utils.parseEther("0.001"))
  // await stableSwapModule.setFeeOut(ethers.utils.parseEther("0.001"))
  // await authTokenAdapter.grantRole(await authTokenAdapter.WHITELISTED(), stableSwapModule.address)
  // await accessControlConfig.grantRole(await accessControlConfig.POSITION_MANAGER_ROLE(), stableSwapModule.address)
  // await accessControlConfig.grantRole(await accessControlConfig.COLLATERAL_MANAGER_ROLE(), stableSwapModule.address)

  return {
    // wbnb,
    // proxyWalletRegistry,
    // ibTokenAdapter,
    // ibWBNBAdapter,
    stablecoinAdapter,
    bookKeeper,
    // dummyToken,
    // shield,
    // alpacaToken,
    // bnbVault,
    // fairLaunch,
    fathomStablecoinProxyActions,
    positionManager,
    stabilityFeeCollector,
    fathomStablecoin,
    liquidationEngine,
    fixedSpreadLiquidationStrategy,
    simplePriceFeed,
    systemDebtEngine,
    mockFlashLendingCalleeMintable,
    mockFlashLendingCallee,
    collateralPoolConfig,
    flashLiquidator,
    // pancakeRouter: routerV2,
    stableSwapModule,
    // authTokenAdapter,
    // BUSD,
    // ibBUSD,
    // ibBUSDAdapter,
    // ibBUSDVault,
  }
}

describe("FlashLiquidation", () => {
  // Accounts
  let deployer
  let alice
  let bob
  let dev

  // Account Addresses
  let deployerAddress
  let aliceAddress
  let bobAddress
  let devAddress

  // Contracts
  let proxyWalletRegistry

  let proxyWalletRegistryAsAlice
  let proxyWalletRegistryAsBob

  let deployerProxyWallet
  let aliceProxyWallet

  let wbnb
  let ibTokenAdapter
  let ibWBNBAdapter
  let ibBUSDAdapter
  let stablecoinAdapter
  let bookKeeper
  let dummyToken
  let BUSD
  let ibBUSD
  let shield
  let alpacaToken
  let fairLaunch
  let bnbVault
  let ibBUSDVault

  let positionManager

  let stabilityFeeCollector

  let liquidationEngine
  let fixedSpreadLiquidationStrategy

  let alpacaStablecoinProxyActions

  let alpacaStablecoin

  let simplePriceFeed

  let systemDebtEngine

  let mockFlashLendingCalleeMintable
  let mockFlashLendingCallee

  let collateralPoolConfig

  let flashLiquidator

  let pancakeRouter

  // Signer
  let ibTokenAdapterAsAlice
  let ibTokenAdapterAsBob

  let dummyTokenasAlice
  let bnbVaultasAlice
  let busdTokenasAlice
  let dummyTokenasBob

  let liquidationEngineAsBob

  let simplePriceFeedAsDeployer

  let bookKeeperAsBob

  let stableSwapModule

  let authTokenAdapter

  before(async () => {
    // ;({
    //   proxyWallets: [deployerProxyWallet, aliceProxyWallet],
    // } = await waffle.loadFixture(loadProxyWalletFixtureHandler))
    await snapshot.revertToSnapshot();

  })

  beforeEach(async () => {
    console.log("4441")
    ;({
      // wbnb,
      // proxyWalletRegistry,
      // ibTokenAdapter,
      // ibWBNBAdapter,
      stablecoinAdapter,
      bookKeeper,
      // dummyToken,
      // shield,
      // alpacaToken,
      // bnbVault,
      // fairLaunch,
      alpacaStablecoinProxyActions,
      positionManager,
      stabilityFeeCollector,
      alpacaStablecoin,
      liquidationEngine,
      fixedSpreadLiquidationStrategy,
      simplePriceFeed,
      systemDebtEngine,
      mockFlashLendingCalleeMintable,
      mockFlashLendingCallee,
      collateralPoolConfig,
      flashLiquidator,
      // pancakeRouter,
      stableSwapModule,
      // authTokenAdapter,
      // BUSD,
      // ibBUSD,
      // ibBUSDAdapter,
      // ibBUSDVault,
    } = await loadFixture(loadFixtureHandler))

    deployer = accounts[0]
    alice = accounts[1]
    bob = accounts[2]
    dev = accounts[3]

    // proxyWalletRegistryAsAlice = ProxyWalletRegistry__factory.connect(proxyWalletRegistry.address, alice)
    // proxyWalletRegistryAsBob = ProxyWalletRegistry__factory.connect(proxyWalletRegistry.address, bob)

    // ibTokenAdapterAsAlice = IbTokenAdapter__factory.connect(ibTokenAdapter.address, alice)
    // ibTokenAdapterAsBob = IbTokenAdapter__factory.connect(ibTokenAdapter.address, bob)

    // dummyTokenasAlice = BEP20__factory.connect(dummyToken.address, alice)
    // bnbVaultasAlice = BEP20__factory.connect(bnbVault.address, alice)
    // busdTokenasAlice = BEP20__factory.connect(BUSD.address, alice)
    // dummyTokenasBob = BEP20__factory.connect(dummyToken.address, bob)

    // liquidationEngineAsBob = LiquidationEngine__factory.connect(liquidationEngine.address, bob)

    // simplePriceFeedAsDeployer = SimplePriceFeed__factory.connect(simplePriceFeed.address, deployer)

    // bookKeeperAsBob = BookKeeper__factory.connect(bookKeeper.address, bob)
  })

  describe("#liquidate with MockFlashLiquidator", async () => {
    context("safety buffer -0.1%, but liquidator does not have enough AUSD to liquidate", async () => {
      it("should success", async () => {
        // 1. Set priceWithSafetyMargin for dummyToken to 2 USD
        await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(2))

        // 2. Alice open a new position with 1 dummyToken and draw 1 AUSD
        const lockedCollateralAmount = WeiPerWad
        const drawStablecoinAmount = WeiPerWad
        const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData("openLockTokenAndDraw", [
          positionManager.address,
          stabilityFeeCollector.address,
          ibTokenAdapter.address,
          stablecoinAdapter.address,
          COLLATERAL_POOL_ID,
          lockedCollateralAmount,
          drawStablecoinAmount,
          true,
          ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
        ])
        await dummyTokenasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
        await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall)
        const alicePositionAddress = await positionManager.positions(1)
        const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
        const alicePosition = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)

        expect(
          alicePosition.lockedCollateral,
          "lockedCollateral should be 1 dummyToken, because Alice locked 1 dummyToken"
        ).to.be.equal(WeiPerWad)
        expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(WeiPerWad)
        expect(
          await bookKeeper.collateralToken(COLLATERAL_POOL_ID, alicePositionAddress),
          "collateralToken inside Alice's position address should be 0 dummyToken, because Alice locked all dummyToken into the position"
        ).to.be.equal(0)
        expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
        expect(
          await alpacaToken.balanceOf(aliceProxyWallet.address),
          "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
        ).to.be.equal(0)

        // 3. dummyToken price drop to 0.99 USD
        await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.sub(1))
        await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))

        // 4. Bob liquidate Alice's position up to full close factor successfully
        const debtShareToRepay = ethers.utils.parseEther("0.5")
        await bookKeeperAsBob.whitelist(liquidationEngine.address)

        await expect(
          liquidationEngineAsBob.liquidate(
            COLLATERAL_POOL_ID,
            alicePositionAddress,
            debtShareToRepay,
            debtShareToRepay,
            mockFlashLendingCallee.address,
            ethers.utils.defaultAbiCoder.encode(["address", "bytes"], [bobAddress, []])
          )
        ).to.be.reverted
      })
    })

    // context("safety buffer -0.1%, position is liquidated up to full close factor with flash liquidation", async () => {
    //   it("should success", async () => {
    //     // 1. Set priceWithSafetyMargin for dummyToken to 2 USD
    //     await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(2))

    //     // 2. Alice open a new position with 1 dummyToken and draw 1 AUSD
    //     const lockedCollateralAmount = WeiPerWad
    //     const drawStablecoinAmount = WeiPerWad
    //     const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData("openLockTokenAndDraw", [
    //       positionManager.address,
    //       stabilityFeeCollector.address,
    //       ibTokenAdapter.address,
    //       stablecoinAdapter.address,
    //       COLLATERAL_POOL_ID,
    //       lockedCollateralAmount,
    //       drawStablecoinAmount,
    //       true,
    //       ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
    //     ])
    //     await dummyTokenasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
    //     await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall)
    //     const alicePositionAddress = await positionManager.positions(1)
    //     const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
    //     const alicePosition = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)

    //     expect(
    //       alicePosition.lockedCollateral,
    //       "lockedCollateral should be 1 dummyToken, because Alice locked 1 dummyToken"
    //     ).to.be.equal(WeiPerWad)
    //     expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(WeiPerWad)
    //     expect(
    //       await bookKeeper.collateralToken(COLLATERAL_POOL_ID, alicePositionAddress),
    //       "collateralToken inside Alice's position address should be 0 dummyToken, because Alice locked all dummyToken into the position"
    //     ).to.be.equal(0)
    //     expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
    //     expect(
    //       await alpacaToken.balanceOf(aliceProxyWallet.address),
    //       "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
    //     ).to.be.equal(0)

    //     // 3. dummyToken price drop to 0.99 USD
    //     await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.sub(1))
    //     await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))

    //     // 4. Bob liquidate Alice's position up to full close factor successfully
    //     const debtShareToRepay = ethers.utils.parseEther("0.5")
    //     await bookKeeperAsBob.whitelist(liquidationEngine.address)
    //     await bookKeeperAsBob.whitelist(fixedSpreadLiquidationStrategy.address)
    //     await bookKeeper.mintUnbackedStablecoin(deployerAddress, bobAddress, WeiPerRad.mul(100))
    //     const bobStablecoinBeforeLiquidation = await bookKeeper.stablecoin(bobAddress)
    //     const expectedSeizedCollateral = debtShareToRepay.mul(LIQUIDATOR_INCENTIVE_BPS).div(BPS)
    //     const expectedLiquidatorIncentive = expectedSeizedCollateral.sub(
    //       expectedSeizedCollateral.mul(BPS).div(LIQUIDATOR_INCENTIVE_BPS)
    //     )
    //     const expectedTreasuryFee = expectedLiquidatorIncentive.mul(TREASURY_FEE_BPS).div(BPS)
    //     const expectedCollateralBobShouldReceive = expectedSeizedCollateral.sub(expectedTreasuryFee)
    //     await liquidationEngineAsBob.liquidate(
    //       COLLATERAL_POOL_ID,
    //       alicePositionAddress,
    //       debtShareToRepay,
    //       debtShareToRepay,
    //       mockFlashLendingCalleeMintable.address,
    //       ethers.utils.defaultAbiCoder.encode(["address", "bytes32"], [bobAddress, COLLATERAL_POOL_ID])
    //     )

    //     // 5. Settle system bad debt
    //     await systemDebtEngine.settleSystemBadDebt(debtShareToRepay.mul(WeiPerRay))

    //     const bobStablecoinAfterLiquidation = await bookKeeper.stablecoin(bobAddress)
    //     const alicePositionAfterLiquidation = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)
    //     expect(
    //       alicePositionAfterLiquidation.lockedCollateral,
    //       "lockedCollateral should be 0.4875 dummyToken after including liquidator incentive and treasury fee"
    //     )
    //       .to.be.equal(lockedCollateralAmount.sub(expectedSeizedCollateral))
    //       .to.be.equal(ethers.utils.parseEther("0.4875"))
    //     expect(
    //       alicePositionAfterLiquidation.debtShare,
    //       "debtShare should be 0.5 AUSD, because Bob liquidated 0.5 AUSD from Alice's position"
    //     )
    //       .to.be.equal(alicePosition.debtShare.sub(debtShareToRepay))
    //       .to.be.equal(ethers.utils.parseEther("0.5"))
    //     expect(
    //       await bookKeeper.systemBadDebt(systemDebtEngine.address),
    //       "System bad debt should be 0 AUSD"
    //     ).to.be.equal(0)
    //     expect(
    //       await bookKeeper.collateralToken(COLLATERAL_POOL_ID, bobAddress),
    //       "Bob should receive 0.50625 dummyToken"
    //     )
    //       .to.be.equal(expectedCollateralBobShouldReceive)
    //       .to.be.equal(ethers.utils.parseEther("0.50625"))
    //     expect(
    //       bobStablecoinBeforeLiquidation.sub(bobStablecoinAfterLiquidation),
    //       "Bob should pay 0.5 AUSD for this liquidation"
    //     ).to.be.equal(ethers.utils.parseEther("0.5").mul(WeiPerRay))
    //     expect(
    //       await bookKeeper.collateralToken(COLLATERAL_POOL_ID, systemDebtEngine.address),
    //       "SystemDebtEngine should receive 0.00625 dummyToken as treasury fee"
    //     )
    //       .to.be.equal(expectedTreasuryFee)
    //       .to.be.equal(ethers.utils.parseEther("0.00625"))
    //     expect(
    //       await alpacaToken.balanceOf(aliceProxyWallet.address),
    //       "Alice's proxy wallet should have more than 0 ALPACA, because the liquidation process will distribute the pending ALPACA rewards to the position owner"
    //     ).to.not.equal(0)
    //   })
    // })
  })

  // describe("#liquidate with FlashLiquidator", async () => {
  //   context(
  //     "safety buffer -0.1%, position is liquidated up to full close factor with flash liquidation; AUSD is obtained by swapping at PancakeSwap",
  //     async () => {
  //       it("should success", async () => {
  //         // 1. Set priceWithSafetyMargin for dummyToken to 2 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(2))

  //         // 2. Alice open a new position with 1 dummyToken and draw 1 AUSD
  //         const lockedCollateralAmount = WeiPerWad
  //         const drawStablecoinAmount = WeiPerWad
  //         const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData("openLockTokenAndDraw", [
  //           positionManager.address,
  //           stabilityFeeCollector.address,
  //           ibTokenAdapter.address,
  //           stablecoinAdapter.address,
  //           COLLATERAL_POOL_ID,
  //           lockedCollateralAmount,
  //           drawStablecoinAmount,
  //           true,
  //           ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
  //         ])
  //         await dummyTokenasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
  //         await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall)
  //         const alicePositionAddress = await positionManager.positions(1)
  //         const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
  //         const alicePosition = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)

  //         expect(
  //           alicePosition.lockedCollateral,
  //           "lockedCollateral should be 1 dummyToken, because Alice locked 1 dummyToken"
  //         ).to.be.equal(WeiPerWad)
  //         expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(
  //           WeiPerWad
  //         )
  //         expect(
  //           await bookKeeper.collateralToken(COLLATERAL_POOL_ID, alicePositionAddress),
  //           "collateralToken inside Alice's position address should be 0 dummyToken, because Alice locked all dummyToken into the position"
  //         ).to.be.equal(0)
  //         expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
  //         ).to.be.equal(0)

  //         // 3. dummyToken price drop to 0.99 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.sub(1))
  //         await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))

  //         // 4. Bob liquidate Alice's position up to full close factor successfully
  //         const debtShareToRepay = ethers.utils.parseEther("0.5")
  //         await bookKeeperAsBob.whitelist(liquidationEngine.address)
  //         await bookKeeperAsBob.whitelist(fixedSpreadLiquidationStrategy.address)
  //         await bookKeeper.mintUnbackedStablecoin(deployerAddress, bobAddress, WeiPerRad.mul(100))
  //         const bobStablecoinBeforeLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const expectedSeizedCollateral = debtShareToRepay.mul(LIQUIDATOR_INCENTIVE_BPS).div(BPS)
  //         const expectedLiquidatorIncentive = expectedSeizedCollateral.sub(
  //           expectedSeizedCollateral.mul(BPS).div(LIQUIDATOR_INCENTIVE_BPS)
  //         )
  //         const expectedTreasuryFee = expectedLiquidatorIncentive.mul(TREASURY_FEE_BPS).div(BPS)
  //         const expectedCollateralBobShouldReceive = expectedSeizedCollateral.sub(expectedTreasuryFee)

  //         await bookKeeper.mintUnbackedStablecoin(
  //           deployerAddress,
  //           deployerAddress,
  //           ethers.utils.parseEther("1000").mul(WeiPerRay)
  //         )
  //         await stablecoinAdapter.withdraw(deployerAddress, ethers.utils.parseEther("1000"), "0x")
  //         await dummyToken.mint(deployerAddress, ethers.utils.parseEther("1000"))
  //         await BUSD.mint(deployerAddress, ethers.utils.parseEther("1000"))

  //         await dummyToken.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(authTokenAdapter.address, MaxUint256)
  //         await pancakeRouter.addLiquidity(
  //           dummyToken.address,
  //           BUSD.address,
  //           ethers.utils.parseEther("1000"),
  //           ethers.utils.parseEther("1000"),
  //           "0",
  //           "0",
  //           deployerAddress,
  //           FOREVER
  //         )

  //         const expectedAmountOut = await pancakeRouter.getAmountOut(
  //           expectedCollateralBobShouldReceive,
  //           ethers.utils.parseEther("1000"),
  //           ethers.utils.parseEther("1000")
  //         )

  //         await liquidationEngineAsBob.liquidate(
  //           COLLATERAL_POOL_ID,
  //           alicePositionAddress,
  //           debtShareToRepay,
  //           debtShareToRepay,
  //           flashLiquidator.address,
  //           ethers.utils.defaultAbiCoder.encode(
  //             ["address", "address", "address", "address", "address[]", "address"],
  //             [
  //               bobAddress,
  //               ibTokenAdapter.address,
  //               AddressZero,
  //               pancakeRouter.address,
  //               [dummyToken.address, BUSD.address],
  //               stableSwapModule.address,
  //             ]
  //           )
  //         )

  //         // feeFromSwap = fee + debtShareToRepay
  //         const feeFromSwap = await (await bookKeeper.stablecoin(systemDebtEngine.address)).div(WeiPerRay)
  //         const expectedProfitFromLiquidation = expectedAmountOut.sub(feeFromSwap.add(1))

  //         // 5. Settle system bad debt
  //         await systemDebtEngine.settleSystemBadDebt(debtShareToRepay.mul(WeiPerRay))

  //         const bobStablecoinAfterLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const alicePositionAfterLiquidation = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)
  //         expect(
  //           alicePositionAfterLiquidation.lockedCollateral,
  //           "lockedCollateral should be 0.4875 dummyToken after including liquidator incentive and treasury fee"
  //         )
  //           .to.be.equal(lockedCollateralAmount.sub(expectedSeizedCollateral))
  //           .to.be.equal(ethers.utils.parseEther("0.4875"))
  //         expect(
  //           alicePositionAfterLiquidation.debtShare,
  //           "debtShare should be 0.5 AUSD, because Bob liquidated 0.5 AUSD from Alice's position"
  //         )
  //           .to.be.equal(alicePosition.debtShare.sub(debtShareToRepay))
  //           .to.be.equal(ethers.utils.parseEther("0.5"))
  //         expect(
  //           await bookKeeper.systemBadDebt(systemDebtEngine.address),
  //           "System bad debt should be 0 AUSD"
  //         ).to.be.equal(0)
  //         expect(
  //           await bookKeeper.collateralToken(COLLATERAL_POOL_ID, bobAddress),
  //           "Bob should not receive dummyToken, because Bob use flash liquidation to sell all of them"
  //         ).to.be.equal(ethers.utils.parseEther("0"))
  //         expect(
  //           bobStablecoinAfterLiquidation.sub(bobStablecoinBeforeLiquidation),
  //           "Bob should pay 0 AUSD for this liquidation due to using flash liquidation with dex"
  //         ).to.be.gte(0)
  //         expect(
  //           await bookKeeper.collateralToken(COLLATERAL_POOL_ID, systemDebtEngine.address),
  //           "SystemDebtEngine should receive 0.00625 dummyToken as treasury fee"
  //         )
  //           .to.be.equal(expectedTreasuryFee)
  //           .to.be.equal(ethers.utils.parseEther("0.00625"))
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have more than 0 ALPACA, because the liquidation process will distribute the pending ALPACA rewards to the position owner"
  //         ).to.not.equal(0)

  //         const alpacaStablecoinBalanceBefore = await alpacaStablecoin.balanceOf(deployerAddress)
  //         await flashLiquidator.withdrawToken(
  //           alpacaStablecoin.address,
  //           await alpacaStablecoin.balanceOf(flashLiquidator.address)
  //         )
  //         const alpacaStablecoinBalanceAfter = await alpacaStablecoin.balanceOf(deployerAddress)
  //         expect(
  //           alpacaStablecoinBalanceAfter.sub(alpacaStablecoinBalanceBefore),
  //           "Flash Liquidation profit should be 0.004729494491680053 AUSD"
  //         ).to.be.equal(expectedProfitFromLiquidation)
  //       })
  //     }
  //   )
  //   context(
  //     "(BNB Pool) safety buffer -0.1%, position is liquidated up to full close factor with flash liquidation; AUSD is obtained by swapping at PancakeSwap",
  //     async () => {
  //       it("should success", async () => {
  //         // 1. Set priceWithSafetyMargin for wbnb to 2 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(WBNB_COLLATERAL_POOL_ID, WeiPerRay.mul(2))
  //         // 2. Alice open a new position with 1 wbnb and draw 1 AUSD
  //         const lockedCollateralAmount = WeiPerWad
  //         const drawStablecoinAmount = WeiPerWad

  //         const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData(
  //           "convertBNBOpenLockTokenAndDraw",
  //           [
  //             bnbVault.address,
  //             positionManager.address,
  //             stabilityFeeCollector.address,
  //             ibWBNBAdapter.address,
  //             stablecoinAdapter.address,
  //             WBNB_COLLATERAL_POOL_ID,
  //             drawStablecoinAmount,
  //             ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
  //           ]
  //         )

  //         await bnbVaultasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
  //         await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall, {
  //           value: lockedCollateralAmount,
  //         })
  //         const alicePositionAddress = await positionManager.positions(1)
  //         const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
  //         const alicePosition = await bookKeeper.positions(WBNB_COLLATERAL_POOL_ID, alicePositionAddress)
  //         expect(
  //           alicePosition.lockedCollateral,
  //           "lockedCollateral should be 1 wbnb, because Alice locked 1 wbnb"
  //         ).to.be.equal(WeiPerWad)
  //         expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(
  //           WeiPerWad
  //         )
  //         expect(
  //           await bookKeeper.collateralToken(WBNB_COLLATERAL_POOL_ID, alicePositionAddress),
  //           "collateralToken inside Alice's position address should be 0 wbnb, because Alice locked all wbnb into the position"
  //         ).to.be.equal(0)
  //         expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
  //         ).to.be.equal(0)

  //         // 3. wbnb price drop to 0.99 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(WBNB_COLLATERAL_POOL_ID, WeiPerRay.sub(1))
  //         await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))
  //         // 4. Bob liquidate Alice's position up to full close factor successfully
  //         const debtShareToRepay = ethers.utils.parseEther("0.5")
  //         await bookKeeperAsBob.whitelist(liquidationEngine.address)
  //         await bookKeeperAsBob.whitelist(fixedSpreadLiquidationStrategy.address)
  //         await bookKeeper.mintUnbackedStablecoin(deployerAddress, bobAddress, WeiPerRad.mul(100))
  //         const bobStablecoinBeforeLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const expectedSeizedCollateral = debtShareToRepay.mul(LIQUIDATOR_INCENTIVE_BPS).div(BPS)
  //         const expectedLiquidatorIncentive = expectedSeizedCollateral.sub(
  //           expectedSeizedCollateral.mul(BPS).div(LIQUIDATOR_INCENTIVE_BPS)
  //         )
  //         const expectedTreasuryFee = expectedLiquidatorIncentive.mul(TREASURY_FEE_BPS).div(BPS)
  //         const expectedCollateralBobShouldReceive = expectedSeizedCollateral.sub(expectedTreasuryFee)

  //         await bookKeeper.mintUnbackedStablecoin(
  //           deployerAddress,
  //           deployerAddress,
  //           ethers.utils.parseEther("1000").mul(WeiPerRay)
  //         )
  //         await stablecoinAdapter.withdraw(deployerAddress, ethers.utils.parseEther("1000"), "0x")
  //         await BUSD.mint(deployerAddress, ethers.utils.parseEther("1000"))
  //         await wbnb.deposit({ value: ethers.utils.parseEther("1000") })
  //         await wbnb.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(authTokenAdapter.address, MaxUint256)
  //         await pancakeRouter.addLiquidity(
  //           wbnb.address,
  //           BUSD.address,
  //           ethers.utils.parseEther("1000"),
  //           ethers.utils.parseEther("1000"),
  //           "0",
  //           "0",
  //           deployerAddress,
  //           FOREVER
  //         )
  //         const expectedAmountOut = await pancakeRouter.getAmountOut(
  //           expectedCollateralBobShouldReceive,
  //           ethers.utils.parseEther("1000"),
  //           ethers.utils.parseEther("1000")
  //         )

  //         await liquidationEngineAsBob.liquidate(
  //           WBNB_COLLATERAL_POOL_ID,
  //           alicePositionAddress,
  //           debtShareToRepay,
  //           debtShareToRepay,
  //           flashLiquidator.address,
  //           ethers.utils.defaultAbiCoder.encode(
  //             ["address", "address", "address", "address", "address[]", "address"],
  //             [
  //               bobAddress,
  //               ibWBNBAdapter.address,
  //               bnbVault.address,
  //               pancakeRouter.address,
  //               [wbnb.address, BUSD.address],
  //               stableSwapModule.address,
  //             ]
  //           )
  //         )

  //         // feeFromSwap = fee + debtShareToRepay
  //         const feeFromSwap = await (await bookKeeper.stablecoin(systemDebtEngine.address)).div(WeiPerRay)
  //         const expectedProfitFromLiquidation = expectedAmountOut.sub(feeFromSwap.add(1))

  //         // 5. Settle system bad debt
  //         await systemDebtEngine.settleSystemBadDebt(debtShareToRepay.mul(WeiPerRay))

  //         const bobStablecoinAfterLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const alicePositionAfterLiquidation = await bookKeeper.positions(
  //           WBNB_COLLATERAL_POOL_ID,
  //           alicePositionAddress
  //         )
  //         expect(
  //           alicePositionAfterLiquidation.lockedCollateral,
  //           "lockedCollateral should be 0.4875 wbnb after including liquidator incentive and treasury fee"
  //         )
  //           .to.be.equal(lockedCollateralAmount.sub(expectedSeizedCollateral))
  //           .to.be.equal(ethers.utils.parseEther("0.4875"))
  //         expect(
  //           alicePositionAfterLiquidation.debtShare,
  //           "debtShare should be 0.5 AUSD, because Bob liquidated 0.5 AUSD from Alice's position"
  //         )
  //           .to.be.equal(alicePosition.debtShare.sub(debtShareToRepay))
  //           .to.be.equal(ethers.utils.parseEther("0.5"))
  //         expect(
  //           await bookKeeper.systemBadDebt(systemDebtEngine.address),
  //           "System bad debt should be 0 AUSD"
  //         ).to.be.equal(0)
  //         expect(
  //           await bookKeeper.collateralToken(WBNB_COLLATERAL_POOL_ID, bobAddress),
  //           "Bob should not receive wbnb, because Bob use flash liquidation to sell all of them"
  //         ).to.be.equal(ethers.utils.parseEther("0"))
  //         expect(
  //           bobStablecoinAfterLiquidation.sub(bobStablecoinBeforeLiquidation),
  //           "Bob should pay 0 AUSD for this liquidation due to using flash liquidation with dex"
  //         ).to.be.gte(0)
  //         expect(
  //           await bookKeeper.collateralToken(WBNB_COLLATERAL_POOL_ID, systemDebtEngine.address),
  //           "SystemDebtEngine should receive 0.00625 wbnb as treasury fee"
  //         )
  //           .to.be.equal(expectedTreasuryFee)
  //           .to.be.equal(ethers.utils.parseEther("0.00625"))
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have more than 0 ALPACA, because the liquidation process will distribute the pending ALPACA rewards to the position owner"
  //         ).to.not.equal(0)

  //         const alpacaStablecoinBalanceBefore = await alpacaStablecoin.balanceOf(deployerAddress)
  //         await flashLiquidator.withdrawToken(
  //           alpacaStablecoin.address,
  //           await alpacaStablecoin.balanceOf(flashLiquidator.address)
  //         )
  //         const alpacaStablecoinBalanceAfter = await alpacaStablecoin.balanceOf(deployerAddress)
  //         expect(
  //           alpacaStablecoinBalanceAfter.sub(alpacaStablecoinBalanceBefore),
  //           "Flash Liquidation profit should be 0.004729494491680053 AUSD"
  //         ).to.be.equal(expectedProfitFromLiquidation)
  //       })
  //     }
  //   )
  //   context(
  //     "(BUSD Pool) safety buffer -0.1%, position is liquidated up to full close factor with flash liquidation; AUSD is obtained by swapping at PancakeSwap",
  //     async () => {
  //       it("should success", async () => {
  //         // 1. Set priceWithSafetyMargin for ibBUSD to 2 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(IBBUSD_COLLATERAL_POOL_ID, WeiPerRay.mul(2))

  //         // 2. Alice open a new position with 1 ibBUSD and draw 1 AUSD
  //         const lockedCollateralAmount = WeiPerWad
  //         const drawStablecoinAmount = WeiPerWad
  //         const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData(
  //           "convertOpenLockTokenAndDraw",
  //           [
  //             ibBUSDVault.address,
  //             positionManager.address,
  //             stabilityFeeCollector.address,
  //             ibBUSDAdapter.address,
  //             stablecoinAdapter.address,
  //             IBBUSD_COLLATERAL_POOL_ID,
  //             lockedCollateralAmount,
  //             drawStablecoinAmount,
  //             ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
  //           ]
  //         )

  //         await busdTokenasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
  //         await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall)
  //         const alicePositionAddress = await positionManager.positions(1)
  //         const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
  //         const alicePosition = await bookKeeper.positions(IBBUSD_COLLATERAL_POOL_ID, alicePositionAddress)

  //         expect(
  //           alicePosition.lockedCollateral,
  //           "lockedCollateral should be 1 ibBUSD, because Alice locked 1 ibBUSD"
  //         ).to.be.equal(WeiPerWad)
  //         expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(
  //           WeiPerWad
  //         )
  //         expect(
  //           await bookKeeper.collateralToken(IBBUSD_COLLATERAL_POOL_ID, alicePositionAddress),
  //           "collateralToken inside Alice's position address should be 0 ibBUSD, because Alice locked all ibBUSD into the position"
  //         ).to.be.equal(0)
  //         expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
  //         ).to.be.equal(0)

  //         // 3. ibBUSD price drop to 0.99 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(IBBUSD_COLLATERAL_POOL_ID, WeiPerRay.sub(1))
  //         await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))

  //         // 4. Bob liquidate Alice's position up to full close factor successfully
  //         const debtShareToRepay = ethers.utils.parseEther("0.5")
  //         await bookKeeperAsBob.whitelist(liquidationEngine.address)
  //         await bookKeeperAsBob.whitelist(fixedSpreadLiquidationStrategy.address)
  //         await bookKeeper.mintUnbackedStablecoin(deployerAddress, bobAddress, WeiPerRad.mul(100))
  //         const bobStablecoinBeforeLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const expectedSeizedCollateral = debtShareToRepay.mul(LIQUIDATOR_INCENTIVE_BPS).div(BPS)
  //         const expectedLiquidatorIncentive = expectedSeizedCollateral.sub(
  //           expectedSeizedCollateral.mul(BPS).div(LIQUIDATOR_INCENTIVE_BPS)
  //         )
  //         const expectedTreasuryFee = expectedLiquidatorIncentive.mul(TREASURY_FEE_BPS).div(BPS)
  //         const expectedCollateralBobShouldReceive = expectedSeizedCollateral.sub(expectedTreasuryFee)

  //         await bookKeeper.mintUnbackedStablecoin(
  //           deployerAddress,
  //           deployerAddress,
  //           ethers.utils.parseEther("1000").mul(WeiPerRay)
  //         )
  //         await stablecoinAdapter.withdraw(deployerAddress, ethers.utils.parseEther("1000"), "0x")

  //         await BUSD.mint(deployerAddress, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(ibBUSDVault.address, ethers.utils.parseEther("1000"))
  //         await ibBUSDVault.deposit(ethers.utils.parseEther("1000"))
  //         await BUSD.approve(authTokenAdapter.address, MaxUint256)

  //         const expectedAmountOut = expectedCollateralBobShouldReceive

  //         await liquidationEngineAsBob.liquidate(
  //           IBBUSD_COLLATERAL_POOL_ID,
  //           alicePositionAddress,
  //           debtShareToRepay,
  //           debtShareToRepay,
  //           flashLiquidator.address,
  //           ethers.utils.defaultAbiCoder.encode(
  //             ["address", "address", "address", "address", "address[]", "address"],
  //             [
  //               bobAddress,
  //               ibBUSDAdapter.address,
  //               ibBUSDVault.address,
  //               pancakeRouter.address,
  //               [BUSD.address],
  //               stableSwapModule.address,
  //             ]
  //           )
  //         )

  //         // feeFromSwap = fee + debtShareToRepay
  //         const feeFromSwap = await (await bookKeeper.stablecoin(systemDebtEngine.address)).div(WeiPerRay)
  //         const expectedProfitFromLiquidation = expectedAmountOut.sub(feeFromSwap.add(1))

  //         // 5. Settle system bad debt
  //         await systemDebtEngine.settleSystemBadDebt(debtShareToRepay.mul(WeiPerRay))

  //         const bobStablecoinAfterLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const alicePositionAfterLiquidation = await bookKeeper.positions(
  //           IBBUSD_COLLATERAL_POOL_ID,
  //           alicePositionAddress
  //         )
  //         expect(
  //           alicePositionAfterLiquidation.lockedCollateral,
  //           "lockedCollateral should be 0.4875 ibBUSD after including liquidator incentive and treasury fee"
  //         )
  //           .to.be.equal(lockedCollateralAmount.sub(expectedSeizedCollateral))
  //           .to.be.equal(ethers.utils.parseEther("0.4875"))
  //         expect(
  //           alicePositionAfterLiquidation.debtShare,
  //           "debtShare should be 0.5 AUSD, because Bob liquidated 0.5 AUSD from Alice's position"
  //         )
  //           .to.be.equal(alicePosition.debtShare.sub(debtShareToRepay))
  //           .to.be.equal(ethers.utils.parseEther("0.5"))
  //         expect(
  //           await bookKeeper.systemBadDebt(systemDebtEngine.address),
  //           "System bad debt should be 0 AUSD"
  //         ).to.be.equal(0)
  //         expect(
  //           await bookKeeper.collateralToken(IBBUSD_COLLATERAL_POOL_ID, bobAddress),
  //           "Bob should not receive ibBUSD, because Bob use flash liquidation to sell all of them"
  //         ).to.be.equal(ethers.utils.parseEther("0"))
  //         expect(
  //           bobStablecoinAfterLiquidation.sub(bobStablecoinBeforeLiquidation),
  //           "Bob should pay 0 AUSD for this liquidation due to using flash liquidation with dex"
  //         ).to.be.gte(0)
  //         expect(
  //           await bookKeeper.collateralToken(IBBUSD_COLLATERAL_POOL_ID, systemDebtEngine.address),
  //           "SystemDebtEngine should receive 0.00625 ibBUSD as treasury fee"
  //         )
  //           .to.be.equal(expectedTreasuryFee)
  //           .to.be.equal(ethers.utils.parseEther("0.00625"))
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have more than 0 ALPACA, because the liquidation process will distribute the pending ALPACA rewards to the position owner"
  //         ).to.not.equal(0)

  //         const alpacaStablecoinBalanceBefore = await alpacaStablecoin.balanceOf(deployerAddress)
  //         await flashLiquidator.withdrawToken(
  //           alpacaStablecoin.address,
  //           await alpacaStablecoin.balanceOf(flashLiquidator.address)
  //         )

  //         const alpacaStablecoinBalanceAfter = await alpacaStablecoin.balanceOf(deployerAddress)

  //         expect(
  //           alpacaStablecoinBalanceAfter.sub(alpacaStablecoinBalanceBefore),
  //           "Flash Liquidation profit should be 0.004729494491680053 AUSD"
  //         ).to.be.equal(expectedProfitFromLiquidation)
  //       })
  //     }
  //   )
  //   context(
  //     "safety buffer -0.1%, position is liquidated up to full close factor with flash liquidation; AUSD is obtained by swapping at PancakeSwap, but result into not enough AUSD to repay debt",
  //     async () => {
  //       it("should revert", async () => {
  //         // 1. Set priceWithSafetyMargin for dummyToken to 2 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.mul(2))

  //         // 2. Alice open a new position with 1 dummyToken and draw 1 AUSD
  //         const lockedCollateralAmount = WeiPerWad
  //         const drawStablecoinAmount = WeiPerWad
  //         const openPositionCall = alpacaStablecoinProxyActions.interface.encodeFunctionData("openLockTokenAndDraw", [
  //           positionManager.address,
  //           stabilityFeeCollector.address,
  //           ibTokenAdapter.address,
  //           stablecoinAdapter.address,
  //           COLLATERAL_POOL_ID,
  //           lockedCollateralAmount,
  //           drawStablecoinAmount,
  //           true,
  //           ethers.utils.defaultAbiCoder.encode(["address"], [aliceAddress]),
  //         ])
  //         await dummyTokenasAlice.approve(aliceProxyWallet.address, WeiPerWad.mul(10000))
  //         await aliceProxyWallet["execute(address,bytes)"](alpacaStablecoinProxyActions.address, openPositionCall)
  //         const alicePositionAddress = await positionManager.positions(1)
  //         const alpacaStablecoinBalance = await alpacaStablecoin.balanceOf(aliceAddress)
  //         const alicePosition = await bookKeeper.positions(COLLATERAL_POOL_ID, alicePositionAddress)

  //         expect(
  //           alicePosition.lockedCollateral,
  //           "lockedCollateral should be 1 dummyToken, because Alice locked 1 dummyToken"
  //         ).to.be.equal(WeiPerWad)
  //         expect(alicePosition.debtShare, "debtShare should be 1 AUSD, because Alice drew 1 AUSD").to.be.equal(
  //           WeiPerWad
  //         )
  //         expect(
  //           await bookKeeper.collateralToken(COLLATERAL_POOL_ID, alicePositionAddress),
  //           "collateralToken inside Alice's position address should be 0 dummyToken, because Alice locked all dummyToken into the position"
  //         ).to.be.equal(0)
  //         expect(alpacaStablecoinBalance, "Alice should receive 1 AUSD from drawing 1 AUSD").to.be.equal(WeiPerWad)
  //         expect(
  //           await alpacaToken.balanceOf(aliceProxyWallet.address),
  //           "Alice's proxy wallet should have 0 ALPACA, as Alice has not harvest any rewards from her position"
  //         ).to.be.equal(0)

  //         // 3. dummyToken price drop to 0.99 USD
  //         await collateralPoolConfig.setPriceWithSafetyMargin(COLLATERAL_POOL_ID, WeiPerRay.sub(1))
  //         await simplePriceFeedAsDeployer.setPrice(WeiPerRay.sub(1).div(1e9))

  //         // 4. Bob liquidate Alice's position up to full close factor successfully
  //         const debtShareToRepay = ethers.utils.parseEther("0.5")
  //         await bookKeeperAsBob.whitelist(liquidationEngine.address)
  //         await bookKeeperAsBob.whitelist(fixedSpreadLiquidationStrategy.address)
  //         await bookKeeper.mintUnbackedStablecoin(deployerAddress, bobAddress, WeiPerRad.mul(100))
  //         const bobStablecoinBeforeLiquidation = await bookKeeper.stablecoin(bobAddress)
  //         const expectedSeizedCollateral = debtShareToRepay.mul(LIQUIDATOR_INCENTIVE_BPS).div(BPS)
  //         const expectedLiquidatorIncentive = expectedSeizedCollateral.sub(
  //           expectedSeizedCollateral.mul(BPS).div(LIQUIDATOR_INCENTIVE_BPS)
  //         )
  //         const expectedTreasuryFee = expectedLiquidatorIncentive.mul(TREASURY_FEE_BPS).div(BPS)
  //         const expectedCollateralBobShouldReceive = expectedSeizedCollateral.sub(expectedTreasuryFee)

  //         await bookKeeper.mintUnbackedStablecoin(
  //           deployerAddress,
  //           deployerAddress,
  //           ethers.utils.parseEther("1000").mul(WeiPerRay)
  //         )
  //         await stablecoinAdapter.withdraw(deployerAddress, ethers.utils.parseEther("1000"), "0x")
  //         await dummyToken.mint(deployerAddress, ethers.utils.parseEther("1000"))
  //         await BUSD.mint(deployerAddress, ethers.utils.parseEther("1000"))

  //         await dummyToken.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(pancakeRouter.address, ethers.utils.parseEther("1000"))
  //         await BUSD.approve(authTokenAdapter.address, MaxUint256)
  //         await pancakeRouter.addLiquidity(
  //           dummyToken.address,
  //           BUSD.address,
  //           ethers.utils.parseEther("1"),
  //           ethers.utils.parseEther("1"),
  //           "0",
  //           "0",
  //           deployerAddress,
  //           FOREVER
  //         )

  //         const expectedAmountOut = await pancakeRouter.getAmountOut(
  //           expectedCollateralBobShouldReceive,
  //           ethers.utils.parseEther("1000"),
  //           ethers.utils.parseEther("1000")
  //         )
  //         const expectedProfitFromLiquidation = expectedAmountOut.sub(debtShareToRepay)

  //         await expect(
  //           liquidationEngineAsBob.liquidate(
  //             COLLATERAL_POOL_ID,
  //             alicePositionAddress,
  //             debtShareToRepay,
  //             debtShareToRepay,
  //             flashLiquidator.address,
  //             ethers.utils.defaultAbiCoder.encode(
  //               ["address", "address", "address", "address", "address[]", "address"],
  //               [
  //                 bobAddress,
  //                 ibTokenAdapter.address,
  //                 AddressZero,
  //                 pancakeRouter.address,
  //                 [dummyToken.address, BUSD.address],
  //                 stableSwapModule.address,
  //               ]
  //             )
  //           )
  //         ).to.be.revertedWith("PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT")
        // })
      // }
    // )
  // })
})