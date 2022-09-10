// SPDX-License-Identifier: AGPL-3.0-or-later
// Original Copyright Alpaca Fin Corporation 2022
// Copyright Fathom 2022

pragma solidity 0.6.12;

import "../interfaces/IPriceFeed.sol";
import "../interfaces/IFathomOracle.sol";

contract StrictFathomOraclePriceFeed is IPriceFeed {
    struct FathomOracleConfig {
        IFathomOracle fathomOracle;
        address token0;
        address token1;
    }

    // primary.fathomOracle will be use as the price source
    FathomOracleConfig public primary;
    // secondary.fathomOracle will be use as the price ref for diff checking
    FathomOracleConfig public secondary;

    uint256 public priceLife; // [seconds] how old the price is considered stale, default 1 day
    uint256 public maxPriceDiff; // [basis point] ie. 5% diff = 10500 (105%)
    // --- Init ---
    constructor(
        address _primaryFathomOracle,
        address _primaryToken0,
        address _primaryToken1,
        address _secondaryFathomOracle,
        address _secondaryToken0,
        address _secondaryToken1,
        address _accessControlConfig
    ) public {
        
        primary.fathomOracle = IFathomOracle(_primaryFathomOracle);
        primary.token0 = _primaryToken0;
        primary.token1 = _primaryToken1;

        secondary.fathomOracle = IFathomOracle(_secondaryFathomOracle);
        secondary.token0 = _secondaryToken0;
        secondary.token1 = _secondaryToken1;

        // Sanity check
        primary.fathomOracle.getPrice(primary.token0, primary.token1);
        secondary.fathomOracle.getPrice(secondary.token0, secondary.token1);

        priceLife = 1 days;
        maxPriceDiff = 10500;
    }
    event LogSetPriceLife(address indexed caller, uint256 second);
    event LogSetMaxPriceDiff(address indexed caller, uint256 maxPriceDiff);
    event LogSetPrimary(address indexed caller, address newFathomOracle, address primaryToken0, address primaryToken1);
    event LogSetSecondary(
        address indexed caller,
        address newFathomOracle,
        address secondaryToken0,
        address secondaryToken1
    );

    /// @dev access: OWNER_ROLE
    function setPriceLife(uint256 _second) external {
        require(_second >= 1 hours && _second <= 1 days, "StrictFathomOraclePriceFeed/bad-price-life");
        priceLife = _second;
        emit LogSetPriceLife(msg.sender, _second);
    }

    /// @dev access: OWNER_ROLE
    function setMaxPriceDiff(uint256 _maxPriceDiff) external {
        maxPriceDiff = _maxPriceDiff;
        emit LogSetMaxPriceDiff(msg.sender, _maxPriceDiff);
    }

    /// @dev access: OWNER_ROLE
    function setPrimary(
        address _primaryFathomOracle,
        address _primaryToken0,
        address _primaryToken1
    ) external {
        primary.fathomOracle = IFathomOracle(_primaryFathomOracle);
        primary.token0 = _primaryToken0;
        primary.token1 = _primaryToken1;
        primary.fathomOracle.getPrice(primary.token0, primary.token1);
        emit LogSetPrimary(msg.sender, _primaryFathomOracle, _primaryToken0, _primaryToken1);
    }

    /// @dev access: OWNER_ROLE
    function setSecondary(
        address _secondaryFathomOracle,
        address _secondaryToken0,
        address _secondaryToken1
    ) external {
        secondary.fathomOracle = IFathomOracle(_secondaryFathomOracle);
        secondary.token0 = _secondaryToken0;
        secondary.token1 = _secondaryToken1;
        secondary.fathomOracle.getPrice(secondary.token0, secondary.token1);
        emit LogSetSecondary(msg.sender, _secondaryFathomOracle, _secondaryToken0, _secondaryToken1);
    }
    function readPrice() external view override returns (bytes32) {
        (uint256 price, ) = primary.fathomOracle.getPrice(primary.token0, primary.token1);
        return bytes32(price);
    }

    function peekPrice() external view override returns (bytes32, bool) {
        (uint256 primaryPrice, uint256 primaryLastUpdate) = primary.fathomOracle.getPrice(primary.token0, primary.token1);
        (uint256 secondaryPrice, uint256 secondaryLastUpdate) = secondary.fathomOracle.getPrice(
            secondary.token0,
            secondary.token1
        );

        return (bytes32(primaryPrice), _isPriceOk(primaryPrice, secondaryPrice, primaryLastUpdate, secondaryLastUpdate));
    }

    function _isPriceOk(
        uint256 primaryPrice,
        uint256 secondaryPrice,
        uint256 primaryLastUpdate,
        uint256 secondaryLastUpdate
    ) internal view returns (bool) {
        return
            _isPriceFresh(primaryLastUpdate, secondaryLastUpdate) &&
            _isPriceStable(primaryPrice, secondaryPrice);
            // !paused();
    }

    function _isPriceFresh(uint256 primaryLastUpdate, uint256 secondaryLastUpdate) internal view returns (bool) {
        // solhint-disable not-rely-on-time
        return primaryLastUpdate >= (now - priceLife) && secondaryLastUpdate >= (now - priceLife);
    }

    function _isPriceStable(uint256 primaryPrice, uint256 secondaryPrice) internal view returns (bool) {
        return
            // price must not too high
            (primaryPrice * (10000)) <= (secondaryPrice * (maxPriceDiff)) &&
            // price must not too low
            (primaryPrice * (maxPriceDiff)) >= (secondaryPrice * (10000));
    }
}
