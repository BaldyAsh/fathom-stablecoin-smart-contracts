// SPDX-License-Identifier: MIT
// Original Copyright Alpaca Fin Corporation 2022
// Copyright Fathom 2022

pragma solidity 0.6.12;

interface IFathomVaultConfig {
    /// @dev Return minimum BaseToken debt size per position.
    function minDebtSize() external view returns (uint256);

    /// @dev Return the interest rate per second, using 1e18 as denom.
    function getInterestRate(uint256 debt, uint256 floating) external view returns (uint256);

    /// @dev Return the address of wrapped native token.
    function getWrappedNativeAddr() external view returns (address);

    /// @dev Return the address of wNative relayer.
    function getWNativeRelayer() external view returns (address);

    /// @dev Return the address of fair launch contract.
    function getFairLaunchAddr() external view returns (address);

    /// @dev Return the bps rate for reserve pool.
    function getReservePoolBps() external view returns (uint256);

    /// @dev Return the bps rate for Avada Kill caster.
    function getKillBps() external view returns (uint256);

    /// @dev Return if the caller is whitelisted.
    function whitelistedCallers(address caller) external returns (bool);

    /// @dev Return if the caller is whitelisted.
    function whitelistedLiquidators(address caller) external returns (bool);

    /// @dev Return if the given strategy is approved.
    function approvedAddStrategies(address addStrats) external returns (bool);

    /// @dev Return whether the given address is a worker.
    function isWorker(address worker) external view returns (bool);

    /// @dev Return whether the given worker accepts more debt. Revert on non-worker.
    function acceptDebt(address worker) external view returns (bool);

    /// @dev Return the work factor for the worker + BaseToken debt, using 1e4 as denom. Revert on non-worker.
    function workFactor(address worker, uint256 debt) external view returns (uint256);

    /// @dev Return the kill factor for the worker + BaseToken debt, using 1e4 as denom. Revert on non-worker.
    function killFactor(address worker, uint256 debt) external view returns (uint256);

    /// @dev Return the kill factor for the worker + BaseToken debt without checking isStable, using 1e4 as denom. Revert on non-worker.
    function rawKillFactor(address worker, uint256 debt) external view returns (uint256);

    /// @dev Return the portion of reward that will be transferred to treasury account after successfully killing a position.
    function getKillTreasuryBps() external view returns (uint256);

    /// @dev Return the address of treasury account
    function getTreasuryAddr() external view returns (address);

    /// @dev Return if worker is stable
    function isWorkerStable(address worker) external view returns (bool);

    /// @dev Return if reserve that worker is working with is consistent
    function isWorkerReserveConsistent(address worker) external view returns (bool);
}
