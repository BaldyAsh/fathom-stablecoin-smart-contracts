
const { ethers } = require("ethers");
const chai = require('chai');
const { expect } = chai
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { WeiPerRay, WeiPerWad } = require("../../helper/unit")
const { DeployerAddress, AliceAddress, BobAddress, AddressZero } = require("../../helper/address");
const { getContract, createMock } = require("../../helper/contracts");
const { loadFixture } = require("../../helper/fixtures");

const { formatBytes32String } = ethers.utils

const loadFixtureHandler = async () => {
  mockedAccessControlConfig = await createMock("AccessControlConfig");
  mockedCollateralPoolConfig = await createMock("CollateralPoolConfig");
  mockedBookKeeper = await createMock("BookKeeper");
  mockedSystemDebtEngine = await createMock("SystemDebtEngine");
  mockedPriceOracle = await createMock("PriceOracle");
  mockedFixedSpreadLiquidationStrategy = await createMock("FixedSpreadLiquidationStrategy");

  await mockedBookKeeper.mock.collateralPoolConfig.returns(mockedCollateralPoolConfig.address)
  await mockedBookKeeper.mock.accessControlConfig.returns(mockedAccessControlConfig.address)
  await mockedBookKeeper.mock.totalStablecoinIssued.returns(0)
  await mockedSystemDebtEngine.mock.surplusBuffer.returns(0)
  await mockedAccessControlConfig.mock.OWNER_ROLE.returns(formatBytes32String("OWNER_ROLE"))
  await mockedAccessControlConfig.mock.SHOW_STOPPER_ROLE.returns(formatBytes32String("SHOW_STOPPER_ROLE"))
  await mockedAccessControlConfig.mock.GOV_ROLE.returns(formatBytes32String("GOV_ROLE"))
  await mockedAccessControlConfig.mock.hasRole.returns(true)
  await mockedPriceOracle.mock.setPrice.returns()

  liquidationEngine = getContract("LiquidationEngine", DeployerAddress)
  liquidationEngineAsAlice = getContract("LiquidationEngine", AliceAddress)
  liquidationEngineAsBob = getContract("LiquidationEngine", BobAddress)

  await liquidationEngine.initialize(mockedBookKeeper.address, mockedSystemDebtEngine.address, mockedPriceOracle.address);
  await liquidationEngine.whitelist(DeployerAddress);
  await liquidationEngine.whitelist(AliceAddress);

  await mockedAccessControlConfig.mock.hasRole.returns(false)


  return {
    liquidationEngine,
    liquidationEngineAsAlice,
    mockedBookKeeper,
    mockedFixedSpreadLiquidationStrategy,
    mockedCollateralPoolConfig,
    mockedAccessControlConfig
  }
}

describe("LiquidationEngine", () => {
  // Contracts
  let mockedBookKeeper
  let mockedFixedSpreadLiquidationStrategy
  let mockedCollateralPoolConfig
  let mockedAccessControlConfig

  let liquidationEngine
  let liquidationEngineAsAlice

  before(async () => {
    await snapshot.revertToSnapshot();
  })

  beforeEach(async () => {
    ({
      liquidationEngine,
      liquidationEngineAsAlice,
      mockedBookKeeper,
      mockedFixedSpreadLiquidationStrategy,
      mockedCollateralPoolConfig,
      mockedAccessControlConfig,
    } = await loadFixture(loadFixtureHandler))
  })

  describe("#liquidate", () => {
    context("liquidator is not whitelisted", () => {
      it("should be revert", async () => {
        await expect(
          liquidationEngineAsBob.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/liquidator-not-whitelisted")
      })
    })
    context("liquidator removed from whitelist", () => {
      it("should be revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(true)
        await liquidationEngine.blacklist(AliceAddress);

        await expect(
          liquidationEngineAsAlice.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/liquidator-not-whitelisted")
      })
    })
    context("when liquidation engine does not live", () => {
      it("should be revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(true)

        await liquidationEngine.cage()

        await expect(
          liquidationEngine.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/not-live")
      })
    })
    context("when debtShareToRepay == 0", () => {
      it("should be revert", async () => {
        await expect(
          liquidationEngine.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            0,
            0,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/zero-debt-value-to-be-liquidated")
      })
    })
    context("when liquidation engine colllteral pool does not set strategy", () => {
      it("should be revert", async () => {
        await mockedBookKeeper.mock.positions.returns(WeiPerWad.mul(10), WeiPerWad.mul(5))
        await mockedCollateralPoolConfig.mock.getDebtAccumulatedRate.returns(WeiPerRay)
        await mockedCollateralPoolConfig.mock.getPriceWithSafetyMargin.returns(WeiPerRay)
        await mockedCollateralPoolConfig.mock.getStrategy.returns(AddressZero)

        await expect(
          liquidationEngine.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/not-set-strategy")
      })
    })
  })

  describe("#cage()", () => {
    context("when role can't access", () => {
      it("should revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(false)

        await expect(liquidationEngineAsAlice.cage()).to.be.revertedWith("!(ownerRole or showStopperRole)")
      })
    })

    context("when role can access", () => {
      context("caller is owner role ", () => {
        it("should be set live to 0", async () => {
          await mockedAccessControlConfig.mock.hasRole.returns(true)

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)

          await expect(liquidationEngineAsAlice.cage()).to.emit(liquidationEngineAsAlice, "LogCage").withArgs()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(0)
        })
      })

      context("caller is showStopper role", () => {
        it("should be set live to 0", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("SHOW_STOPPER_ROLE"), AliceAddress).returns(true)

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)

          await expect(liquidationEngineAsAlice.cage()).to.emit(liquidationEngineAsAlice, "LogCage").withArgs()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(0)
        })
      })
    })
  })

  describe("#uncage()", () => {
    context("when role can't access", () => {
      it("should revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(false)

        await expect(liquidationEngineAsAlice.uncage()).to.be.revertedWith("!(ownerRole or showStopperRole)")
      })
    })

    context("when role can access", () => {
      context("caller is owner role ", () => {
        it("should be set live to 1", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("OWNER_ROLE"), AliceAddress).returns(true)

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)

          await liquidationEngineAsAlice.cage()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(0)

          await expect(liquidationEngineAsAlice.uncage()).to.emit(liquidationEngineAsAlice, "LogUncage").withArgs()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)
        })
      })

      context("caller is showStopper role", () => {
        it("should be set live to 1", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("SHOW_STOPPER_ROLE"), AliceAddress).returns(true)

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)

          await liquidationEngineAsAlice.cage()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(0)

          await expect(liquidationEngineAsAlice.uncage()).to.emit(liquidationEngineAsAlice, "LogUncage").withArgs()

          expect(await liquidationEngineAsAlice.live()).to.be.equal(1)
        })
      })
    })
  })

  describe("#pause", () => {
    context("when role can't access", () => {
      it("should revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(false)

        await expect(liquidationEngineAsAlice.pause()).to.be.revertedWith("!(ownerRole or govRole)")
      })
    })

    context("when role can access", () => {
      context("and role is owner role", () => {
        it("should be success", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("OWNER_ROLE"), DeployerAddress).returns(true)

          await liquidationEngine.pause()
        })
      })
    })

    context("and role is gov role", () => {
      it("should be success", async () => {
        await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("GOV_ROLE"), DeployerAddress).returns(true)

        await liquidationEngine.pause()
      })
    })

    context("when pause contract", () => {
      it("shouldn't be able to call liquidate", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(true)

        await liquidationEngine.pause()

        // mock contract
        await mockedBookKeeper.mock.positions.returns(WeiPerWad.mul(10), WeiPerWad.mul(10))
        await mockedCollateralPoolConfig.mock.getDebtAccumulatedRate.returns(WeiPerRay)
        await mockedCollateralPoolConfig.mock.getPriceWithSafetyMargin.returns(WeiPerRay)
        await mockedCollateralPoolConfig.mock.getStrategy.returns(mockedFixedSpreadLiquidationStrategy.address)

        await mockedFixedSpreadLiquidationStrategy.mock.execute.returns()

        await expect(
          liquidationEngine.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("Pausable: paused")
      })
    })
  })

  describe("#unpause", () => {
    context("when role can't access", () => {
      it("should revert", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(false)

        await expect(liquidationEngineAsAlice.unpause()).to.be.revertedWith("!(ownerRole or govRole)")
      })
    })

    context("when role can access", () => {
      context("and role is owner role", () => {
        it("should be success", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("OWNER_ROLE"), DeployerAddress).returns(true)


          await liquidationEngine.pause()
          await liquidationEngine.unpause()
        })
      })

      context("and role is gov role", () => {
        it("should be success", async () => {
          await mockedAccessControlConfig.mock.hasRole.withArgs(formatBytes32String("GOV_ROLE"), DeployerAddress).returns(true)


          await liquidationEngine.pause()
          await liquidationEngine.unpause()
        })
      })
    })

    context("when unpause contract", () => {
      it("should liquidate but revert because debt share not decrease", async () => {
        await mockedAccessControlConfig.mock.hasRole.returns(true)

        // pause contract
        await liquidationEngine.pause()

        // unpause contract
        await liquidationEngine.unpause()

        // mock contract
        await mockedBookKeeper.mock.positions.withArgs(formatBytes32String("WXDC"), AliceAddress).returns(WeiPerWad.mul(10), WeiPerWad.mul(10))
        await mockedBookKeeper.mock.stablecoin.returns(0)
        await mockedFixedSpreadLiquidationStrategy.mock.execute.withArgs(
          formatBytes32String("WXDC"),
          WeiPerWad.mul(10),
          WeiPerWad.mul(10),
          AliceAddress,
          WeiPerWad,
          WeiPerWad,
          DeployerAddress,
          DeployerAddress,
          ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress])
        ).returns()
        await mockedCollateralPoolConfig.mock.getDebtAccumulatedRate.returns(WeiPerRay.mul(2))
        await mockedCollateralPoolConfig.mock.getPriceWithSafetyMargin.returns(WeiPerRay)
        await mockedCollateralPoolConfig.mock.getStrategy.returns(mockedFixedSpreadLiquidationStrategy.address)

        await expect(
          liquidationEngine.liquidate(
            formatBytes32String("WXDC"),
            AliceAddress,
            WeiPerWad,
            WeiPerWad,
            DeployerAddress,
            ethers.utils.defaultAbiCoder.encode(["address", "address"], [DeployerAddress, DeployerAddress]),
            { gasLimit: 1000000 }
          )
        ).to.be.revertedWith("LiquidationEngine/debt-not-liquidated")
      })
    })
  })
})
