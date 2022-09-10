// SPDX-License-Identifier: AGPL-3.0-or-later
// Original Copyright Alpaca Fin Corporation 2022
// Copyright Fathom 2022

pragma solidity 0.6.12;

import "../interfaces/IBookKeeper.sol";
import "../interfaces/IStablecoin.sol";

interface IStablecoinAdapter {
    function bookKeeper() external returns (IBookKeeper);

    function stablecoin() external returns (IStablecoin);

    function deposit(
        address positionAddress,
        uint256 wad,
        bytes calldata data
    ) external payable;

    function withdraw(
        address positionAddress,
        uint256 wad,
        bytes calldata data
    ) external;
}
