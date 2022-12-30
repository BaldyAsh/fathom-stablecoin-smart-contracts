const fs = require('fs');

const pools = require("../../common/collateral");
const { getAddresses } = require("../../common/addresses");
const { getProxy } = require("../../common/proxies");

const FathomStablecoinProxyActions = artifacts.require('FathomStablecoinProxyActions.sol');
const Shield = artifacts.require('Shield.sol');
const FathomToken = artifacts.require('FathomToken.sol');

module.exports = async function (deployer) {
    const proxyFactory = await artifacts.initializeInterfaceAt("FathomProxyFactory", "FathomProxyFactory");

    const simplePriceFeed = await getProxy(proxyFactory, "SimplePriceFeed");
    const fixedSpreadLiquidationStrategy = await getProxy(proxyFactory, "FixedSpreadLiquidationStrategy");
    const proxyWalletRegistry = await getProxy(proxyFactory, "ProxyWalletRegistry");
    const stabilityFeeCollector = await getProxy(proxyFactory, "StabilityFeeCollector");
    const stablecoinAdapter = await getProxy(proxyFactory, "StablecoinAdapter");
    const showStopper = await getProxy(proxyFactory, "ShowStopper");
    const priceOracle = await getProxy(proxyFactory, "PriceOracle");
    const fathomStablecoin = await getProxy(proxyFactory, "FathomStablecoin");
    const positionManager = await getProxy(proxyFactory, "PositionManager");
    const systemDebtEngine = await getProxy(proxyFactory, "SystemDebtEngine");
    const liquidationEngine = await getProxy(proxyFactory, "LiquidationEngine");
    const bookKeeper = await getProxy(proxyFactory, "BookKeeper");
    const collateralPoolConfig = await getProxy(proxyFactory, "CollateralPoolConfig");
    const accessControlConfig = await getProxy(proxyFactory, "AccessControlConfig");
    const flashMintModule = await getProxy(proxyFactory, "FlashMintModule");
    const stableSwapModule = await getProxy(proxyFactory, "StableSwapModule");
    const authTokenAdapter = await getProxy(proxyFactory, "AuthTokenAdapter");
    const flashMintArbitrager = await getProxy(proxyFactory, "FlashMintArbitrager");
    const bookKeeperFlashMintArbitrager = await getProxy(proxyFactory, "BookKeeperFlashMintArbitrager");
    const fathomOraclePriceFeedFactory = await getProxy(proxyFactory, "FathomOraclePriceFeedFactory");
    const dexPriceOracle = await getProxy(proxyFactory, "DexPriceOracle");
    const collateralTokenAdapterFactory = await getProxy(proxyFactory, "CollateralTokenAdapterFactory");

    const collateralTokenAdapter = await artifacts.initializeInterfaceAt("CollateralTokenAdapter", "CollateralTokenAdapter");
    const fairLaunch = await artifacts.initializeInterfaceAt("FairLaunch", "FairLaunch");
    const fathomOraclePriceFeed = await artifacts.initializeInterfaceAt("FathomOraclePriceFeed", "FathomOraclePriceFeed");
    const delayFathomOraclePriceFeed = await artifacts.initializeInterfaceAt("DelayFathomOraclePriceFeed", "DelayFathomOraclePriceFeed");
    const proxyWalletFactory = await artifacts.initializeInterfaceAt("ProxyWalletFactory", "ProxyWalletFactory");

    const addresses = getAddresses(deployer.networkId())

    const promises = [
        accessControlConfig.initialize({ gasLimit: 1000000 }),
        collateralPoolConfig.initialize(accessControlConfig.address, { gasLimit: 1000000 }),
        bookKeeper.initialize(
            collateralPoolConfig.address,
            accessControlConfig.address,
            { gasLimit: 1000000 }
        ),
        fathomStablecoin.initialize("Fathom USD", "FXD", { gasLimit: 1000000 }),
        systemDebtEngine.initialize(bookKeeper.address, { gasLimit: 1000000 }),
        liquidationEngine.initialize(
            bookKeeper.address,
            systemDebtEngine.address,
            priceOracle.address,
            { gasLimit: 1000000 }
        ),
        stablecoinAdapter.initialize(
            bookKeeper.address,
            fathomStablecoin.address,
            { gasLimit: 1000000 }
        ),
        priceOracle.initialize(
            bookKeeper.address,
            { gasLimit: 1000000 }
        ),
        showStopper.initialize(
            bookKeeper.address,
            { gasLimit: 1000000 }
        ),
        positionManager.initialize(
            bookKeeper.address,
            showStopper.address,
            priceOracle.address,
            { gasLimit: 1000000 }
        ),
        simplePriceFeed.initialize(
            accessControlConfig.address,
            { gasLimit: 5000000 }
        ),
        fixedSpreadLiquidationStrategy.initialize(
            bookKeeper.address,
            priceOracle.address,
            liquidationEngine.address,
            systemDebtEngine.address,
        ),
        stabilityFeeCollector.initialize(
            bookKeeper.address,
            systemDebtEngine.address,
            { gaslimit: 4050000 }
        ),
        proxyWalletRegistry.initialize(delayFathomOraclePriceFeed.address, { gasLimit: 1000000 }),
        flashMintModule.initialize(
            stablecoinAdapter.address,
            systemDebtEngine.address,
            { gasLimit: 1000000 }
        ),
        authTokenAdapter.initialize(
            bookKeeper.address,
            pools.USDT_STABLE,
            addresses.USDT,
            { gasLimit: 1000000 }
        ),
        stableSwapModule.initialize(
            authTokenAdapter.address,
            stablecoinAdapter.address,
            systemDebtEngine.address,
            { gasLimit: 1000000 }
        ),
        flashMintArbitrager.initialize({ gasLimit: 1000000 }),
        bookKeeperFlashMintArbitrager.initialize(fathomStablecoin.address, { gasLimit: 1000000 }),
        fathomOraclePriceFeedFactory.initialize(fathomOraclePriceFeed.address, { gasLimit: 1000000 }),
        dexPriceOracle.initialize(addresses.DEXFactory, { gasLimit: 1000000 }),
        collateralTokenAdapterFactory.initialize(collateralTokenAdapter.address, { gasLimit: 1000000 })
    ];

    await Promise.all(promises);

    const newAddresses = {
        proxyFactory: proxyFactory.address,
        simplePriceFeedUSDT: simplePriceFeed.address,
        fixedSpreadLiquidationStrategy: fixedSpreadLiquidationStrategy.address,
        proxyWalletRegistry: proxyWalletRegistry.address,
        stabilityFeeCollector: stabilityFeeCollector.address,
        stablecoinAdapter: stablecoinAdapter.address,
        showStopper: showStopper.address,
        priceOracle: priceOracle.address,
        fathomStablecoin: fathomStablecoin.address,
        positionManager: positionManager.address,
        systemDebtEngine: systemDebtEngine.address,
        liquidationEngine: liquidationEngine.address,
        bookKeeper: bookKeeper.address,
        collateralPoolConfig: collateralPoolConfig.address,
        accessControlConfig: accessControlConfig.address,
        flashMintModule: flashMintModule.address,
        stableSwapModule: stableSwapModule.address,
        authTokenAdapter: authTokenAdapter.address,
        flashMintArbitrager: flashMintArbitrager.address,
        bookKeeperFlashMintArbitrager: bookKeeperFlashMintArbitrager.address,
        fathomOraclePriceFeedFactory: fathomOraclePriceFeedFactory.address,
        dexPriceOracle: dexPriceOracle.address,
        collateralTokenAdapterFactory: collateralTokenAdapterFactory.address,
        fairLaunch: fairLaunch.address,
        fathomOraclePriceFeed: fathomOraclePriceFeed.address,
        proxyWalletFactory: proxyWalletFactory.address,
        fathomToken: FathomToken.address,
        shield: Shield.address,
        fathomStablecoinProxyActions: FathomStablecoinProxyActions.address
    }

    fs.writeFileSync('./addresses.json', JSON.stringify(newAddresses));
}