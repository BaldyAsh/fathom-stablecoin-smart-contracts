// SPDX-License-Identifier: AGPL-3.0-or-later
// Original Copyright Alpaca Fin Corporation 2022
// Copyright Fathom 2022

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "../interfaces/IBookKeeper.sol";
import "../interfaces/ISystemDebtEngine.sol";
import "../interfaces/ILiquidationEngine.sol";
import "../interfaces/ILiquidationStrategy.sol";
import "../interfaces/ICagable.sol";
import "../interfaces/ICollateralPoolConfig.sol";

/// @title LiquidationEngine
/// @author Fathom Fin Corporation
/** @notice A contract which is the manager for all of the liquidations of the protocol.
        LiquidationEngine will be the interface for the liquidator to trigger any positions into the liquidation process.
*/

contract LiquidationEngine is ICagable, ILiquidationEngine {
    struct LocalVars {
        uint256 positionLockedCollateral;
        uint256 positionDebtShare;
        uint256 systemDebtEngineStablecoinBefore;
        uint256 newPositionLockedCollateral;
        uint256 newPositionDebtShare;
        uint256 wantStablecoinValueFromLiquidation;
    }

    struct CollateralPoolLocalVars {
        address strategy;
        uint256 priceWithSafetyMargin; // [ray]
        uint256 debtAccumulatedRate; // [ray]
    }

    IBookKeeper public bookKeeper; // CDP Engine
    ISystemDebtEngine public systemDebtEngine; // Debt Engine
    uint256 public override live; // Active Flag

    // --- Init ---
    constructor(address _bookKeeper, address _systemDebtEngine) public {
        IBookKeeper(_bookKeeper).totalStablecoinIssued(); // Sanity Check Call

        bookKeeper = IBookKeeper(_bookKeeper);

        ISystemDebtEngine(_systemDebtEngine).surplusBuffer(); // Sanity Check Call
        systemDebtEngine = ISystemDebtEngine(_systemDebtEngine);

        live = 1;
    }

    // --- Math ---
    uint256 constant WAD = 10**18;

    function liquidate(
        bytes32 _collateralPoolId,
        address _positionAddress,
        uint256 _debtShareToBeLiquidated, // [rad]
        uint256 _maxDebtShareToBeLiquidated, // [wad]
        address _collateralRecipient,
        bytes calldata _data
    ) external override {
        require(live == 1, "LiquidationEngine/not-live");
        require(_debtShareToBeLiquidated != 0, "LiquidationEngine/zero-debt-value-to-be-liquidated");
        require(_maxDebtShareToBeLiquidated != 0, "LiquidationEngine/zero-max-debt-value-to-be-liquidated");

        LocalVars memory _vars;

        (_vars.positionLockedCollateral, _vars.positionDebtShare) = bookKeeper.positions(
            _collateralPoolId,
            _positionAddress
        );
        // 1. Check if the position is underwater
        CollateralPoolLocalVars memory _collateralPoolLocalVars;
        _collateralPoolLocalVars.strategy = ICollateralPoolConfig(bookKeeper.collateralPoolConfig()).getStrategy(
            _collateralPoolId
        );
        _collateralPoolLocalVars.priceWithSafetyMargin = ICollateralPoolConfig(bookKeeper.collateralPoolConfig())
            .getPriceWithSafetyMargin(_collateralPoolId); // [ray]
        _collateralPoolLocalVars.debtAccumulatedRate = ICollateralPoolConfig(bookKeeper.collateralPoolConfig())
            .getDebtAccumulatedRate(_collateralPoolId); // [ray]

        ILiquidationStrategy _strategy = ILiquidationStrategy(_collateralPoolLocalVars.strategy);
        require(address(_strategy) != address(0), "LiquidationEngine/not-set-strategy");

        // (positionLockedCollateral [wad] * priceWithSafetyMargin [ray]) [rad]
        // (positionDebtShare [wad] * debtAccumulatedRate [ray]) [rad]
        require(
            _collateralPoolLocalVars.priceWithSafetyMargin > 0 &&
                (_vars.positionLockedCollateral * (_collateralPoolLocalVars.priceWithSafetyMargin)) <
                (_vars.positionDebtShare * (_collateralPoolLocalVars.debtAccumulatedRate)),
            "LiquidationEngine/position-is-safe"
        );

        _vars.systemDebtEngineStablecoinBefore = bookKeeper.stablecoin(address(systemDebtEngine));

        _strategy.execute(
            _collateralPoolId,
            _vars.positionDebtShare,
            _vars.positionLockedCollateral,
            _positionAddress,
            _debtShareToBeLiquidated,
            _maxDebtShareToBeLiquidated,
            msg.sender,
            _collateralRecipient,
            _data
        );
        (_vars.newPositionLockedCollateral, _vars.newPositionDebtShare) = bookKeeper.positions(
            _collateralPoolId,
            _positionAddress
        );
        require(_vars.newPositionDebtShare < _vars.positionDebtShare, "LiquidationEngine/debt-not-liquidated");

        // (positionDebtShare [wad] - newPositionDebtShare [wad]) * debtAccumulatedRate [ray]

        _vars.wantStablecoinValueFromLiquidation = (_vars.positionDebtShare - (_vars.newPositionDebtShare)) * (
            _collateralPoolLocalVars.debtAccumulatedRate
        ); // [rad]
        require(
            bookKeeper.stablecoin(address(systemDebtEngine)) - (_vars.systemDebtEngineStablecoinBefore) >=
                _vars.wantStablecoinValueFromLiquidation,
            "LiquidationEngine/payment-not-received"
        );

        // If collateral has been depleted from liquidation whilst there is remaining debt in the position
        if (_vars.newPositionLockedCollateral == 0 && _vars.newPositionDebtShare > 0) {
            // Overflow check
            require(_vars.newPositionDebtShare < 2**255, "LiquidationEngine/overflow");
            // Record the bad debt to the system and close the position
            bookKeeper.confiscatePosition(
                _collateralPoolId,
                _positionAddress,
                _positionAddress,
                address(systemDebtEngine),
                0,
                -int256(_vars.newPositionDebtShare)
            );
        }
    }

    /// @dev access: OWNER_ROLE, SHOW_STOPPER_ROLE
    function cage() external override {
        require(live == 1, "LiquidationEngine/not-live");
        live = 0;
        emit LogCage();
    }

    /// @dev access: OWNER_ROLE, SHOW_STOPPER_ROLE
    function uncage() external override {
        require(live == 0, "LiquidationEngine/not-caged");
        live = 1;
        emit LogUncage();
    }
}
