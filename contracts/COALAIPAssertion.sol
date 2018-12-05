pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract COALAIPAssertion is Ownable {
  using SafeMath for uint256;

  uint256 public minimumStake = 10000000000000000;

  // Mapping from assertion ID to owner
  mapping (uint256 => address) internal assertionOwner;

  // Mapping from tokenId to assertionId
  mapping (uint256 => uint256) internal assertionToken;

  // Mapping from assertionId to stake amount
  mapping (uint256 => uint256) internal assertionStake;

  // Array with all assertion ids, used for enumeration
  uint256[] internal allAssertions;

  // Mapping for assertion URIs
  mapping(uint256 => string) internal assertionURIs;

  event Create(
    address indexed _creator,
    uint256 indexed _assertionId,
    uint256 indexed _tokenId
  );

  event Withdraw(
    address indexed _withdrawer,
    uint256 indexed _assertionId,
    uint256 indexed _tokenId
  );

  /**
   * @dev Gets the total amount of assertions stored by the contract
   * @return uint256 representing the total amount of assertions
   */
  function totalSupply() public view returns (uint256) {
    return allAssertions.length;
  }

  /**
   * @dev Returns whether the specified assertion exists
   * @param _assertionId uint256 ID of the assertion to query the existence
   *         of
   * @return whether the assertion exists
   */
  function exists(uint256 _assertionId) public view returns (bool) {
    address owner = assertionOwner[_assertionId];
    return owner != address(0);
  }

  /**
   * @dev Gets the owner of the specified assertion ID
   * @param _assertionId uint256 ID of the assertion to query the owner of
   * @return owner address currently marked as the owner of the given
   *         assertion ID
   */
  function ownerOf(uint256 _assertionId) public view returns (address) {
    address owner = assertionOwner[_assertionId];
    require(owner != address(0));
    return owner;
  }

  /**
   * @dev Returns an URI for a given assertion ID
   * Throws if the assertion ID does not exist. May return an empty string.
   * @param _assertionId uint256 ID of the assertion to query
   */
  function assertionURI(uint256 _assertionId) public view returns (string) {
    require(exists(_assertionId));
    return assertionURIs[_assertionId];
  }

  /**
   * @dev Returns the statke for a given assertion ID.
   * Throws if the assertion ID does not exist. May return 0.
   * @param _assertionId uint256 ID of the assertion to query
   */
  function stakeOfAssertion(
    uint256 _assertionId
  ) public view returns (uint256) {
    require(exists(_assertionId));
    return assertionStake[_assertionId];
  }

  /**
   * @dev Internal function to set the assertion URI for a given assertion
   * Reverts if the assertion ID does not exist
   * @param _assertionId uint256 ID of the assertion to set its URI
   * @param _uri string URI to assign
   */
  function _setAssertionURI(uint256 _assertionId, string _uri) internal {
    require(exists(_assertionId));
    assertionURIs[_assertionId] = _uri;
  }

  function setStake(uint256 _newStake) external onlyOwner {
    minimumStake = _newStake;
  }

  function withdraw(uint256 _assertionId) external {
    require(exists(_assertionId));
    require(ownerOf(_assertionId) == msg.sender);

    uint256 lastAssertion = allAssertions.length.sub(1);
    allAssertions[_assertionId] = lastAssertion;
    allAssertions[allAssertions.length.sub(1)] = 0;
    allAssertions.length--;

    uint256 tokenId = assertionToken[_assertionId];
    uint256 stake = assertionStake[_assertionId];
    assertionOwner[_assertionId] = address(0);
    delete assertionToken[_assertionId];
    delete assertionStake[_assertionId];
    delete assertionURIs[_assertionId];
    msg.sender.transfer(stake);
    emit Withdraw(msg.sender, _assertionId, tokenId);
  }

  function create(
    uint256 _tokenId,
    string _assertionURI
  ) external payable {
    // Minimum stake is 0.01 Ether
    require(msg.value >= minimumStake);

    uint256 assertionId = totalSupply();
    allAssertions.push(assertionId);
    assertionOwner[assertionId] = msg.sender;
    assertionToken[assertionId] = _tokenId;
    assertionStake[assertionId] = msg.value;
    _setAssertionURI(assertionId, _assertionURI);
    emit Create(msg.sender, assertionId, _tokenId);
  }
}
