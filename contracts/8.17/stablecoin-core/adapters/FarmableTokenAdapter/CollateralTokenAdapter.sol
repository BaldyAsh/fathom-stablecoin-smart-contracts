// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "../../../interfaces/IFathomFairLaunch.sol";
import "../../../interfaces/IBookKeeper.sol";
import "../../../interfaces/IFarmableTokenAdapter.sol";
import "../../../interfaces/ITimeLock.sol";
import "../../../interfaces/IShield.sol";
import "../../../interfaces/ICagable.sol";
import "../../../interfaces/IManager.sol";
import "../../../utils/SafeToken.sol";

/// @title CollateralTokenAdapter is the adapter that inherited BaseFarmableTokenAdapter.
/// It receives Fathom's ibTOKEN from users and deposit in Fathom's FairLaunch.
/// Hence, users will still earn FATHOM rewards while holding positions.
contract CollateralTokenAdapter is IFarmableTokenAdapter, PausableUpgradeable, ReentrancyGuardUpgradeable, ICagable {
  using SafeToken for address;

  uint256 internal constant WAD = 10**18;
  uint256 internal constant RAY = 10**27;

  /// @dev The Fathom's Fairlaunch contract
  IFathomFairLaunch public fairlaunch;
  /// @dev The Fathom's Shield contract
  IShield public shield;
  /// @dev The Timelock that owns Shield
  ITimeLock public timelock;
  /// @dev The pool id that this collateralTokenAdapter is working with
  uint256 public pid;

  uint256 public treasuryFeeBps;
  address public treasuryAccount;

  uint256 public live;

  /// @dev Book Keeper instance
  IBookKeeper public bookKeeper;
  /// @dev Collateral Pool ID
  bytes32 public override collateralPoolId;
  /// @dev Token that is used for collateral
  address public override collateralToken;
  /// @dev The decimals of collateralToken
  uint256 public override decimals;
  /// @dev The token that will get after collateral has been staked
  IToken public rewardToken;

  IManager public positionManager;

  /// @dev Rewards per collateralToken in RAY
  uint256 public accRewardPerShare;
  /// @dev Total CollateralTokens that has been staked in WAD
  uint256 public totalShare;
  /// @dev Accummulate reward balance in WAD
  uint256 public accRewardBalance;

  /// @dev Mapping of user => rewardDebts
  mapping(address => uint256) public rewardDebts;
  /// @dev Mapping of user => collteralTokens that he is staking

  mapping(address => uint256) public stake;

  uint256 internal to18ConversionFactor;
  uint256 internal toTokenConversionFactor;

  /// @notice Events
  event LogDeposit(uint256 _val);
  event LogWithdraw(uint256 _val);
  event LogEmergencyWithdraw(address indexed _caller, address _to);
  event LogMoveStake(address indexed _src, address indexed _dst, uint256 _wad);
  event LogSetTreasuryAccount(address indexed _caller, address _treasuryAccount);
  event LogSetTreasuryFeeBps(address indexed _caller, uint256 _treasuryFeeBps);

  modifier onlyOwner() {
    IAccessControlConfig _accessControlConfig = IAccessControlConfig(bookKeeper.accessControlConfig());
    require(_accessControlConfig.hasRole(_accessControlConfig.OWNER_ROLE(), msg.sender), "!ownerRole");
    _;
  }

  modifier onlyOwnerOrGov() {
    IAccessControlConfig _accessControlConfig = IAccessControlConfig(bookKeeper.accessControlConfig());
    require(
      _accessControlConfig.hasRole(_accessControlConfig.OWNER_ROLE(), msg.sender) ||
        _accessControlConfig.hasRole(_accessControlConfig.GOV_ROLE(), msg.sender),
      "!(ownerRole or govRole)"
    );
    _;
  }

  modifier onlyCollateralManager() {
    IAccessControlConfig _accessControlConfig = IAccessControlConfig(bookKeeper.accessControlConfig());
    require(
      _accessControlConfig.hasRole(_accessControlConfig.COLLATERAL_MANAGER_ROLE(), msg.sender),
      "!collateralManager"
    );
    _;
  }

    function initialize(
    address _bookKeeper,
    bytes32 _collateralPoolId,
    address _collateralToken,
    address _rewardToken,
    address _fairlaunch,
    uint256 _pid,
    address _shield,
    address _timelock,
    uint256 _treasuryFeeBps,
    address _treasuryAccount,
    address _positionManager
  ) external initializer {
    // 1. Initialized all dependencies
    PausableUpgradeable.__Pausable_init();
    ReentrancyGuardUpgradeable.__ReentrancyGuard_init();
    // 2. Sanity checks
    (address _stakeToken, , , , ) = IFathomFairLaunch(_fairlaunch).poolInfo(_pid);
    require(_stakeToken == _collateralToken, "CollateralTokenAdapter/collateralToken-not-match");
    require(IFathomFairLaunch(_fairlaunch).fathom() == _rewardToken, "CollateralTokenAdapter/reward-token-not-match");
    require(IFathomFairLaunch(_fairlaunch).owner() == _shield, "CollateralTokenAdapter/shield-not-match");
    require(IShield(_shield).owner() == _timelock, "CollateralTokenAdapter/timelock-not-match");

    fairlaunch = IFathomFairLaunch(_fairlaunch);
    shield = IShield(_shield);
    timelock = ITimeLock(_timelock);
    pid = _pid;

    live = 1;

    bookKeeper = IBookKeeper(_bookKeeper);
    collateralPoolId = _collateralPoolId;
    collateralToken = _collateralToken;
    decimals = IToken(collateralToken).decimals();
    require(decimals <= 18, "CollateralTokenAdapter/decimals > 18");

    to18ConversionFactor = 10**(18 - decimals);
    toTokenConversionFactor = 10**decimals;
    rewardToken = IToken(_rewardToken);

    require(_treasuryAccount != address(0), "CollateralTokenAdapter/bad treasury account");
    require(_treasuryFeeBps <= 5000, "CollateralTokenAdapter/bad treasury fee bps");
    treasuryFeeBps = _treasuryFeeBps;
    treasuryAccount = _treasuryAccount;

    positionManager = IManager(_positionManager);

    address(collateralToken).safeApprove(address(fairlaunch), type(uint).max);
  }

  function add(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    require((_z = _x + _y) >= _x, "ds-math-add-overflow");
  }

  function sub(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    require((_z = _x - _y) <= _x, "ds-math-sub-underflow");
  }

  function mul(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    require(_y == 0 || (_z = _x * _y) / _y == _x, "ds-math-mul-overflow");
  }

  function div(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    require(_y > 0, "ds-math-div-by-zero");
    _z = _x / _y;
  }

  function divup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = add(_x, sub(_y, 1)) / _y;
  }

  function wmul(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = mul(_x, _y) / WAD;
  }

  function wdiv(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = mul(_x, WAD) / _y;
  }

  function wdivup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = divup(mul(_x, WAD), _y);
  }

  function rmul(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = mul(_x, _y) / RAY;
  }

  function rmulup(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = divup(mul(_x, _y), RAY);
  }

  function rdiv(uint256 _x, uint256 _y) internal pure returns (uint256 _z) {
    _z = mul(_x, RAY) / _y;
  }

  function setTreasuryFeeBps(uint256 _treasuryFeeBps) external onlyOwner {
    require(live == 1, "CollateralTokenAdapter/not-live");
    require(_treasuryFeeBps <= 5000, "CollateralTokenAdapter/bad treasury fee bps");
    treasuryFeeBps = _treasuryFeeBps;
    emit LogSetTreasuryFeeBps(msg.sender, _treasuryFeeBps);
  }

  function setTreasuryAccount(address _treasuryAccount) external onlyOwner {
    require(live == 1, "CollateralTokenAdapter/not-live");
    require(_treasuryAccount != address(0), "CollateralTokenAdapter/bad treasury account");
    treasuryAccount = _treasuryAccount;
    emit LogSetTreasuryAccount(msg.sender, _treasuryAccount);
  }

  /// @dev Ignore collateralTokens that have been directly transferred
  function netAssetValuation() public view returns (uint256) {
    return totalShare;
  }

  /// @dev Return Net Assets per Share in wad
  function netAssetPerShare() public view returns (uint256) {
    if (totalShare == 0) return WAD;
    else return wdiv(netAssetValuation(), totalShare);
  }

  /// @dev Harvest FATHOM from FairLaunch
  /// @dev Return the amount of rewards that is harvested.
  /// Expect that the adapter which inherited BaseFarmableTokenAdapter
  function _harvestFromFarm() internal returns (uint256) {
    if (live == 1) {
      // Withdraw all rewards
      uint256 _pendingFathom = fairlaunch.pendingFathom(pid, address(this));
      (uint256 _stakedBalance, , , ) = fairlaunch.userInfo(pid, address(this));
      if (_stakedBalance > 0 && _pendingFathom > 0) fairlaunch.withdraw(address(this), pid, 0);
    }
    return sub(rewardToken.balanceOf(address(this)), accRewardBalance);
  }

  /// @dev Harvest rewards for "_positionAddress" and send to "to"
  /// @param _positionAddress The position address that is owned and staked the collateral tokens
  function _harvest(address _positionAddress) internal {
    // 1. Define the address to receive the harvested rewards
    // Give the rewards to the proxy wallet that owns this position address if there is any
    address _harvestTo = positionManager.mapPositionHandlerToOwner(_positionAddress);
    // defeault _harvestTo as _positionAddress if not properly defined
    if (_harvestTo == address(0)) _harvestTo = _positionAddress;
    require(_harvestTo != address(0), "CollateralTokenAdapter/harvest-to-address-zero");
    // 2. Perform actual harvest. Calculate the new accRewardPerShare.
    if (totalShare > 0) accRewardPerShare = add(accRewardPerShare, rdiv(_harvestFromFarm(), totalShare));
    // 3. Calculate the rewards that "to" should get by:
    // stake[_positionAddress] * accRewardPerShare (rewards that each share should get) - rewardDebts (what already paid)
    uint256 _rewardDebt = rewardDebts[_positionAddress];
    uint256 _rewards = rmul(stake[_positionAddress], accRewardPerShare);
    if (_rewards > _rewardDebt) {
      uint256 _back = sub(_rewards, _rewardDebt);
      uint256 _treasuryFee = div(mul(_back, treasuryFeeBps), 10000);
      address(rewardToken).safeTransfer(treasuryAccount, _treasuryFee);
      address(rewardToken).safeTransfer(_harvestTo, sub(_back, _treasuryFee));
    }

    // 3. Update accRewardBalance
    accRewardBalance = rewardToken.balanceOf(address(this));
  }

  /// @dev For FE to query pending rewards of a given positionAddress
  /// @param _positionAddress The address that you want to check pending FATHOM
  function pendingRewards(address _positionAddress) external view returns (uint256) {
    return _pendingRewards(_positionAddress, fairlaunch.pendingFathom(pid, address(this)));
  }

  /// @dev Like pendingRewards, but it is pending rewards after deduected with treasury fee
  /// @param _positionAddress The address that you want to check pending FATHOM
  function netPendingRewards(address _positionAddress) external view returns (uint256) {
    return _netPendingRewards(_positionAddress, fairlaunch.pendingFathom(pid, address(this)));
  }

  /// @dev Return the amount of rewards to be harvested for a giving position address
  /// @param _positionAddress The position address
  /// @param _pending The pending rewards from staking contract
  function _pendingRewards(address _positionAddress, uint256 _pending) internal view returns (uint256) {
    if (totalShare == 0) return 0;
    uint256 _toBeHarvested = sub(add(_pending, rewardToken.balanceOf(address(this))), accRewardBalance);
    uint256 _pendingAccRewardPerShare = add(accRewardPerShare, rdiv(_toBeHarvested, totalShare));
    uint256 _pendingAccReward = rmul(stake[_positionAddress], _pendingAccRewardPerShare);
    if (_pendingAccReward > rewardDebts[_positionAddress]) {
      return sub(_pendingAccReward, rewardDebts[_positionAddress]);
    } else {
      return 0;
    }
  }

  /// @dev Return the amount of rewards to be harvested for a giving position address, and deducted with treasury fee
  /// @param _positionAddress The position address
  /// @param _pending The pending rewards from staking contract
  function _netPendingRewards(address _positionAddress, uint256 _pending) internal view returns (uint256) {
    uint256 _pendingReward = _pendingRewards(_positionAddress, _pending);
    uint256 _treasuryFee = div(mul(_pendingReward, treasuryFeeBps), 10000);

    return sub(_pendingReward, _treasuryFee);
  }

  /// @dev Harvest and deposit received ibToken to FairLaunch
  /// @param _positionAddress The address that holding states of the position
  /// @param _amount The ibToken amount that being used as a collateral and to be deposited to FairLaunch
  /// @param _data The extra data that may needs to execute the deposit
  function deposit(
    address _positionAddress,
    uint256 _amount,
    bytes calldata _data
  ) external payable override nonReentrant whenNotPaused {
    _deposit(_positionAddress, _amount, _data);
  }

  /// @dev Harvest rewardTokens and distribute to user,
  /// deposit collateral tokens to staking contract, and update BookKeeper
  /// @param _positionAddress The position address to be updated
  /// @param _amount The amount to be deposited
  function _deposit(
    address _positionAddress,
    uint256 _amount,
    bytes calldata /* _data */
  ) private {
    require(live == 1, "CollateralTokenAdapter/not live");

    _harvest(_positionAddress);

    if (_amount > 0) {
      uint256 _share = wdiv(mul(_amount, to18ConversionFactor), netAssetPerShare()); // [wad]
      // Overflow check for int256(wad) cast below
      // Also enforces a non-zero wad
      require(int256(_share) > 0, "CollateralTokenAdapter/share-overflow");
      //I think this line below has a hint. - tracking ibToken when liquidated
      //the wierd thing is that the _amount is 0 in liquidtion process.
      //the best guess so far is that the ibToken does not directly move to
      //the usr's EOA but rather is recorded as staked.
      address(collateralToken).safeTransferFrom(msg.sender, address(this), _amount);
      bookKeeper.addCollateral(collateralPoolId, _positionAddress, int256(_share));
      totalShare = add(totalShare, _share);
      stake[_positionAddress] = add(stake[_positionAddress], _share);
    }
    rewardDebts[_positionAddress] = rmulup(stake[_positionAddress], accRewardPerShare);

    if (_amount > 0) fairlaunch.deposit(address(this), pid, _amount);

    emit LogDeposit(_amount);
  }

  /// @dev Harvest and withdraw ibToken from FairLaunch
  /// @param _usr The address that holding states of the position
  /// @param _amount The ibToken amount to be withdrawn from FairLaunch and return to user
  function withdraw(
    address _usr,
    uint256 _amount,
    bytes calldata /* _data */
  ) external override nonReentrant whenNotPaused {
    if (live == 1) {
      if (_amount > 0) fairlaunch.withdraw(address(this), pid, _amount);
    }
    _withdraw(_usr, _amount);
  }

  /// @dev Harvest rewardTokens and distribute to user,
  /// withdraw collateral tokens from staking contract, and update BookKeeper
  /// @param _usr The position address to be updated
  /// @param _amount The amount to be deposited
  function _withdraw(address _usr, uint256 _amount) private {
    _harvest(msg.sender);

    if (_amount > 0) {
      uint256 _share = wdivup(mul(_amount, to18ConversionFactor), netAssetPerShare()); // [wad]
      // Overflow check for int256(wad) cast below
      // Also enforces a non-zero wad
      require(int256(_share) > 0, "CollateralTokenAdapter/share-overflow");
      require(stake[msg.sender] >= _share, "CollateralTokenAdapter/insufficient staked amount");

      bookKeeper.addCollateral(collateralPoolId, msg.sender, -int256(_share));
      totalShare = sub(totalShare, _share);
      stake[msg.sender] = sub(stake[msg.sender], _share);
      address(collateralToken).safeTransfer(_usr, _amount);
    }
    rewardDebts[msg.sender] = rmulup(stake[msg.sender], accRewardPerShare);
    emit LogWithdraw(_amount);
  }

  /// @dev EMERGENCY ONLY. Withdraw ibToken from FairLaunch with invoking "_harvest"
  function emergencyWithdraw(address _to) external nonReentrant {
    if (live == 1) {
      uint256 _amount = bookKeeper.collateralToken(collateralPoolId, msg.sender);
      fairlaunch.withdraw(address(this), pid, _amount);
    }
    _emergencyWithdraw(_to);
  }

  /// @dev EMERGENCY ONLY. Withdraw collateralTokens from staking contract without invoking _harvest
  /// @param _to The address to received collateralTokens
  function _emergencyWithdraw(address _to) private {
    uint256 _share = bookKeeper.collateralToken(collateralPoolId, msg.sender); //[wad]
    require(_share < 2**255, "CollateralTokenAdapter/share-overflow");
    uint256 _amount = wmul(wmul(_share, netAssetPerShare()), toTokenConversionFactor);
    bookKeeper.addCollateral(collateralPoolId, msg.sender, -int256(_share));
    totalShare = sub(totalShare, _share);
    stake[msg.sender] = sub(stake[msg.sender], _share);
    rewardDebts[msg.sender] = rmulup(stake[msg.sender], accRewardPerShare);
    address(collateralToken).safeTransfer(_to, _amount);
    emit LogEmergencyWithdraw(msg.sender, _to);
  }

  function moveStake(
    address _source,
    address _destination,
    uint256 _share,
    bytes calldata _data
  ) external override nonReentrant whenNotPaused {
    _moveStake(_source, _destination, _share, _data);
  }

  /// @dev Move wad amount of staked balance from source to destination.
  /// Can only be moved if underlaying assets make sense.
  /// @param _source The address to be moved staked balance from
  /// @param _destination The address to be moved staked balance to
  /// @param _share The amount of staked balance to be moved
  /// @dev access: COLLATERAL_MANAGER_ROLE
  function _moveStake(
    address _source,
    address _destination,
    uint256 _share,
    bytes calldata /* data */
  ) private onlyCollateralManager {
    // 1. Update collateral tokens for source and destination
    uint256 _stakedAmount = stake[_source];
    stake[_source] = sub(_stakedAmount, _share);
    stake[_destination] = add(stake[_destination], _share);
    // 2. Update source's rewardDebt due to collateral tokens have
    // moved from source to destination. Hence, rewardDebt should be updated.
    // rewardDebtDiff is how many rewards has been paid for that share.
    uint256 _rewardDebt = rewardDebts[_source];
    uint256 _rewardDebtDiff = mul(_rewardDebt, _share) / _stakedAmount;
    // 3. Update rewardDebts for both source and destination
    // Safe since rewardDebtDiff <= rewardDebts[source]
    rewardDebts[_source] = _rewardDebt - _rewardDebtDiff;
    rewardDebts[_destination] = add(rewardDebts[_destination], _rewardDebtDiff);
    // 4. Sanity check.
    // - stake[source] must more than or equal to collateral + lockedCollateral that source has
    // to prevent a case where someone try to steal stake from source
    // - stake[destination] must less than or eqal to collateral + lockedCollateral that destination has
    // to prevent destination from claim stake > actual collateral that he has
    (uint256 _lockedCollateral, ) = bookKeeper.positions(collateralPoolId, _source);
    require(
      stake[_source] >= add(bookKeeper.collateralToken(collateralPoolId, _source), _lockedCollateral),
      "CollateralTokenAdapter/stake[source] < collateralTokens + lockedCollateral"
    );
    (_lockedCollateral, ) = bookKeeper.positions(collateralPoolId, _destination);
    require(
      stake[_destination] <= add(bookKeeper.collateralToken(collateralPoolId, _destination), _lockedCollateral),
      "CollateralTokenAdapter/stake[destination] > collateralTokens + lockedCollateral"
    );
    emit LogMoveStake(_source, _destination, _share);
  }

  /// @dev Hook function when PositionManager adjust position.
  function onAdjustPosition(
    address _source,
    address _destination,
    int256 _collateralValue,
    int256, /* debtShare */
    bytes calldata _data
  ) external override nonReentrant whenNotPaused {
    uint256 _unsignedCollateralValue = _collateralValue < 0 ? uint256(-_collateralValue) : uint256(_collateralValue);
    _moveStake(_source, _destination, _unsignedCollateralValue, _data);
  }

  function onMoveCollateral(
    address _source,
    address _destination,
    uint256 _share,
    bytes calldata _data
  ) external override nonReentrant whenNotPaused {
    _deposit(_source, 0, _data);
    _moveStake(_source, _destination, _share, _data);
  }

  /// @dev Pause collateralTokenAdapter when assumptions change
  /// @dev access: OWNER_ROLE
  function cage() external override nonReentrant {
    // Allow caging if
    // - msg.sender is whitelisted to do so
    // - Shield's owner has been changed
    IAccessControlConfig _accessControlConfig = IAccessControlConfig(bookKeeper.accessControlConfig());
    require(
      _accessControlConfig.hasRole(_accessControlConfig.OWNER_ROLE(), msg.sender) ||
        shield.owner() != address(timelock),
      "CollateralTokenAdapter/not-authorized"
    );
    require(live == 1, "CollateralTokenAdapter/not-live");
    fairlaunch.emergencyWithdraw(pid);
    live = 0;
    emit LogCage();
  }

  /// @dev access: OWNER_ROLE
  function uncage() external override onlyOwner {
    require(live == 0, "CollateralTokenAdapter/not-caged");
    fairlaunch.deposit(address(this), pid, totalShare);
    live = 1;
    emit LogUncage();
  }

  // --- pause ---
  /// @dev access: OWNER_ROLE, GOV_ROLE
  function pause() external onlyOwnerOrGov {
    _pause();
  }

  /// @dev access: OWNER_ROLE, GOV_ROLE
  function unpause() external onlyOwnerOrGov {
    _unpause();
  }

  /// @dev access: OWNER_ROLE
  function refreshApproval() external nonReentrant onlyOwner {
    address(collateralToken).safeApprove(address(fairlaunch), type(uint).max);
  }
}
