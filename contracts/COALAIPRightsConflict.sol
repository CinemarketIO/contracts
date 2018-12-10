pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract COALAIPRightsConflict is Ownable {
  using SafeMath for uint256;

  uint256 public minimumStake = 10000000000000000;

  // Mapping from rightsConflict ID to owner
  mapping (uint256 => address) internal rightsConflictOwner;

  // Mapping from tokenId to rightsConflictId
  mapping (uint256 => uint256) internal rightsConflictToken;

  // Mapping from rightsConflictId to stake amount
  mapping (uint256 => uint256) internal rightsConflictStake;

  // Array with all rightsConflict ids, used for enumeration
  uint256[] internal allRightsConflicts;

  // Mapping for rightsConflict URIs
  mapping(uint256 => string) internal rightsConflictURIs;

  event Create(
    address indexed _creator,
    uint256 indexed _rightsConflictId,
    uint256 indexed _tokenId
  );

  event Withdraw(
    address indexed _withdrawer,
    uint256 indexed _rightsConflictId,
    uint256 indexed _tokenId
  );

  /**
   * @dev Gets the total amount of rightsConflicts stored by the contract
   * @return uint256 representing the total amount of rightsConflicts
   */
  function totalSupply() public view returns (uint256) {
    return allRightsConflicts.length;
  }

  /**
   * @dev Returns whether the specified rightsConflict exists
   * @param _rightsConflictId uint256 ID of the rightsConflict to query the existence
   *         of
   * @return whether the rightsConflict exists
   */
  function exists(uint256 _rightsConflictId) public view returns (bool) {
    address owner = rightsConflictOwner[_rightsConflictId];
    return owner != address(0);
  }

  /**
   * @dev Gets the owner of the specified rightsConflict ID
   * @param _rightsConflictId uint256 ID of the rightsConflict to query the owner of
   * @return owner address currently marked as the owner of the given
   *         rightsConflict ID
   */
  function ownerOf(uint256 _rightsConflictId) public view returns (address) {
    address owner = rightsConflictOwner[_rightsConflictId];
    require(owner != address(0));
    return owner;
  }

  /**
   * @dev Returns an URI for a given rightsConflict ID
   * Throws if the rightsConflict ID does not exist. May return an empty string.
   * @param _rightsConflictId uint256 ID of the rightsConflict to query
   */
  function rightsConflictURI(uint256 _rightsConflictId) public view returns (string) {
    require(exists(_rightsConflictId));
    return rightsConflictURIs[_rightsConflictId];
  }

  /**
   * @dev Returns the statke for a given rightsConflict ID.
   * Throws if the rightsConflict ID does not exist. May return 0.
   * @param _rightsConflictId uint256 ID of the rightsConflict to query
   */
  function stakeOfRightsConflict(
    uint256 _rightsConflictId
  ) public view returns (uint256) {
    require(exists(_rightsConflictId));
    return rightsConflictStake[_rightsConflictId];
  }

  /**
   * @dev Internal function to set the rightsConflict URI for a given rightsConflict
   * Reverts if the rightsConflict ID does not exist
   * @param _rightsConflictId uint256 ID of the rightsConflict to set its URI
   * @param _uri string URI to assign
   */
  function _setRightsConflictURI(uint256 _rightsConflictId, string _uri) internal {
    require(exists(_rightsConflictId));
    rightsConflictURIs[_rightsConflictId] = _uri;
  }

  function setStake(uint256 _newStake) external onlyOwner {
    minimumStake = _newStake;
  }

  function withdraw(uint256 _rightsConflictId) external {
    require(exists(_rightsConflictId));
    require(ownerOf(_rightsConflictId) == msg.sender);

    uint256 lastRightsConflict = allRightsConflicts.length.sub(1);
    allRightsConflicts[_rightsConflictId] = lastRightsConflict;
    allRightsConflicts[allRightsConflicts.length.sub(1)] = 0;
    allRightsConflicts.length--;

    uint256 tokenId = rightsConflictToken[_rightsConflictId];
    uint256 stake = rightsConflictStake[_rightsConflictId];
    rightsConflictOwner[_rightsConflictId] = address(0);
    delete rightsConflictToken[_rightsConflictId];
    delete rightsConflictStake[_rightsConflictId];
    delete rightsConflictURIs[_rightsConflictId];
    msg.sender.transfer(stake);
    emit Withdraw(msg.sender, _rightsConflictId, tokenId);
  }

  function create(
    uint256 _tokenId,
    string _rightsConflictURI
  ) external payable {
    // Minimum stake is 0.01 Ether
    require(msg.value >= minimumStake);

    uint256 rightsConflictId = totalSupply();
    allRightsConflicts.push(rightsConflictId);
    rightsConflictOwner[rightsConflictId] = msg.sender;
    rightsConflictToken[rightsConflictId] = _tokenId;
    rightsConflictStake[rightsConflictId] = msg.value;
    _setRightsConflictURI(rightsConflictId, _rightsConflictURI);
    emit Create(msg.sender, rightsConflictId, _tokenId);
  }
}
