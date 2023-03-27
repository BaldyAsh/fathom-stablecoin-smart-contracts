/// SPDX-License-Identifier: AGPL-3.0-or-later
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";

import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IFlashLendingCallee.sol";
import "../interfaces/IGenericTokenAdapter.sol";
import "../interfaces/IBookKeeper.sol";
import "../interfaces/IVault.sol";
import "../interfaces/IStableSwapModule.sol";
import "../interfaces/IStablecoinAdapter.sol";
import "../utils/SafeToken.sol";

contract PCSFlashLiquidator is OwnableUpgradeable, IFlashLendingCallee {
    using SafeToken for address;
    using SafeMathUpgradeable for uint256;

    struct LocalVars {
        address liquidatorAddress;
        IGenericTokenAdapter tokenAdapter;
        address vaultAddress;
        IUniswapV2Router02 router;
        address[] path;
        address stableSwapModuleAddress;
    }

    event LogFlashLiquidation(
        address indexed liquidatorAddress,
        uint256 debtValueToRepay,
        uint256 collateralAmountToLiquidate,
        uint256 liquidationProfit
    );
    event LogSellCollateral(uint256 amount, uint256 minAmountOut, uint256 actualAmountOut);
    event LogSwapTokenToStablecoin(uint256 amount, address usr, uint256 receivedAmount);
    event LogSetBUSDAddress(address indexed caller, address busd);
    event LogSetWrappedNativeAddress(address indexed caller, address wrappedNativeAddr);

    // --- Math ---
    uint256 constant WAD = 10 ** 18;
    uint256 constant RAY = 10 ** 27;
    uint256 constant RAD = 10 ** 45;

    IBookKeeper public bookKeeper;
    IStablecoinAdapter public stablecoinAdapter;
    address public alpacaStablecoin;
    address public wrappedNativeAddr;
    address public busd;

    function initialize(
        address _bookKeeper,
        address _alpacaStablecoin,
        address _stablecoinAdapter,
        address _wrappedNativeAddr,
        address _busd
    ) external initializer {
        OwnableUpgradeable.__Ownable_init();

        bookKeeper = IBookKeeper(_bookKeeper);
        alpacaStablecoin = _alpacaStablecoin;
        stablecoinAdapter = IStablecoinAdapter(_stablecoinAdapter);
        wrappedNativeAddr = _wrappedNativeAddr;
        busd = _busd;
    }

    function setWrappedNativeAddress(address _wrappedNativeAddr) external onlyOwner {
        wrappedNativeAddr = _wrappedNativeAddr;
        emit LogSetWrappedNativeAddress(msg.sender, _wrappedNativeAddr);
    }

    function setBUSDAddress(address _busd) external onlyOwner {
        busd = _busd;
        emit LogSetBUSDAddress(msg.sender, _busd);
    }

    function flashLendingCall(
        address _caller,
        uint256 _debtValueToRepay, // [rad]
        uint256 _collateralAmountToLiquidate, // [wad]
        bytes calldata data
    ) external override {
        LocalVars memory _vars;
        (_vars.liquidatorAddress, _vars.tokenAdapter, _vars.vaultAddress, _vars.router, _vars.path, _vars.stableSwapModuleAddress) = abi.decode(
            data,
            (address, IGenericTokenAdapter, address, IUniswapV2Router02, address[], address)
        );

        // Retrieve collateral token
        (address _token, uint256 _actualCollateralAmount) = _retrieveCollateral(_vars.tokenAdapter, _vars.vaultAddress, _collateralAmountToLiquidate);

        // Swap token to AUSD
        require(
            _debtValueToRepay.div(RAY) + 1 <=
                _sellCollateral(_token, _vars.path, _vars.router, _actualCollateralAmount, _debtValueToRepay, _vars.stableSwapModuleAddress),
            "not enough to repay debt"
        );

        // Deposit Alpaca Stablecoin for liquidatorAddress
        uint256 _liquidationProfit = _depositAlpacaStablecoin(_debtValueToRepay.div(RAY) + 1, _vars.liquidatorAddress);
        emit LogFlashLiquidation(_vars.liquidatorAddress, _debtValueToRepay, _collateralAmountToLiquidate, _liquidationProfit);
    }

    function _retrieveCollateral(
        IGenericTokenAdapter _tokenAdapter,
        address _vaultAddress,
        uint256 _amount
    ) internal returns (address _token, uint256 _actualAmount) {
        bookKeeper.whitelist(address(_tokenAdapter));
        _tokenAdapter.withdraw(address(this), _amount, abi.encode(address(this)));
        // _token = _tokenAdapter.collateralToken();
        _actualAmount = _amount;
        // if (_vaultAddress != address(0)) {
        //     _token = IVault(_vaultAddress).token();
        //     if (_token == wrappedNativeAddr) {
        //         uint256 vaultBaseTokenBalanceBefore = address(this).balance;
        //         IVault(_vaultAddress).withdraw(_amount);
        //         uint256 vaultBaseTokenBalanceAfter = address(this).balance;
        //         _actualAmount = vaultBaseTokenBalanceAfter.sub(vaultBaseTokenBalanceBefore);
        //     } else {
        //         uint256 vaultBaseTokenBalanceBefore = IVault(_vaultAddress).token().myBalance();
        //         IVault(_vaultAddress).withdraw(_amount);
        //         uint256 vaultBaseTokenBalanceAfter = IVault(_vaultAddress).token().myBalance();
        //         _actualAmount = vaultBaseTokenBalanceAfter.sub(vaultBaseTokenBalanceBefore);
        //     }
        // }
    }

    function _sellCollateral(
        address _token,
        address[] memory _path,
        IUniswapV2Router02 _router,
        uint256 _amount,
        uint256 _minAmountOut,
        address _stableSwapModuleAddress
    ) internal returns (uint256 receivedAmount) {
        if (_path.length != 0) {
            address _tokencoinAddress = _path[_path.length - 1];
            uint256 _tokencoinBalanceBefore = _tokencoinAddress.myBalance();

            if (_token != busd) {
                if (_token == wrappedNativeAddr) {
                    _router.swapExactETHForTokens{ value: _amount }(_minAmountOut.div(RAY) + 1, _path, address(this), block.timestamp);
                } else {
                    _token.safeApprove(address(_router), type(uint).max);
                    _router.swapExactTokensForTokens(_amount, _minAmountOut.div(RAY) + 1, _path, address(this), block.timestamp);
                    _token.safeApprove(address(_router), 0);
                }
            }
            uint256 _tokencoinBalanceAfter = _tokencoinAddress.myBalance();
            uint256 _tokenAmount = _token != busd ? _tokencoinBalanceAfter.sub(_tokencoinBalanceBefore) : _amount;
            receivedAmount = _swapTokenToStablecoin(_stableSwapModuleAddress, address(this), _tokenAmount, _tokencoinAddress);
            emit LogSellCollateral(_amount, _minAmountOut, receivedAmount);
        }
    }

    function _swapTokenToStablecoin(
        address _stableSwapModuleAddress,
        address _usr,
        uint256 _amount,
        address _tokencoinAddress
    ) internal returns (uint256 receivedAmount) {
        // uint256 _alpacaStablecoinBalanceBefore = alpacaStablecoin.myBalance();
        // IStableSwapModule stableSwapModule = IStableSwapModule(_stableSwapModuleAddress);
        // address authTokenApdapter = address(stableSwapModule.authTokenAdapter());
        // _tokencoinAddress.safeApprove(authTokenApdapter, type(uint).max);
        // stableSwapModule.swapTokenToStablecoin(_usr, _amount);
        // _tokencoinAddress.safeApprove(authTokenApdapter, 0);
        // uint256 _alpacaStablecoinBalanceAfter = alpacaStablecoin.myBalance();
        // receivedAmount = _alpacaStablecoinBalanceAfter.sub(_alpacaStablecoinBalanceBefore);
        // emit LogSwapTokenToStablecoin(_amount, _usr, receivedAmount);
    }

    function _depositAlpacaStablecoin(uint256 _amount, address _liquidatorAddress) internal returns (uint256 _liquidationProfit) {
        uint256 balanceBefore = alpacaStablecoin.myBalance();
        alpacaStablecoin.safeApprove(address(stablecoinAdapter), type(uint).max);
        stablecoinAdapter.deposit(_liquidatorAddress, _amount, abi.encode(0));
        alpacaStablecoin.safeApprove(address(stablecoinAdapter), 0);
        _liquidationProfit = balanceBefore.sub(_amount);
    }

    function whitelist(address _toBeWhitelistedAddress) external onlyOwner {
        bookKeeper.whitelist(_toBeWhitelistedAddress);
    }

    function withdrawToken(address _token, uint256 _amount) external onlyOwner {
        _token.safeTransfer(msg.sender, _amount);
    }

    fallback() external payable {}

    receive() external payable {}
}
