pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract COALAIPAttestation is Ownable {
  using SafeMath for uint256;

  uint256 public minimumStake = 10000000000000000;

  // Mapping from attestation ID to owner
  mapping (uint256 => address) internal attestationOwner;

  // Mapping from tokenId to attestationId
  mapping (uint256 => uint256) internal attestationToken;

  // Mapping from attestationId to stake amount
  mapping (uint256 => uint256) internal attestationStake;

  // Array with all attestation ids, used for enumeration
  uint256[] internal allAttestations;

  // Mapping for attestation URIs
  mapping(uint256 => string) internal attestationURIs;

  event Create(
    address indexed _creator,
    uint256 indexed _attestationId,
    uint256 indexed _tokenId
  );

  event Withdraw(
    address indexed _withdrawer,
    uint256 indexed _attestationId,
    uint256 indexed _tokenId
  );

  /**
   * @dev Gets the total amount of attestations stored by the contract
   * @return uint256 representing the total amount of attestations
   */
  function totalSupply() public view returns (uint256) {
    return allAttestations.length;
  }

  /**
   * @dev Returns whether the specified attestation exists
   * @param _attestationId uint256 ID of the attestation to query the existence
   *         of
   * @return whether the attestation exists
   */
  function exists(uint256 _attestationId) public view returns (bool) {
    address owner = attestationOwner[_attestationId];
    return owner != address(0);
  }

  /**
   * @dev Gets the owner of the specified attestation ID
   * @param _attestationId uint256 ID of the attestation to query the owner of
   * @return owner address currently marked as the owner of the given
   *         attestation ID
   */
  function ownerOf(uint256 _attestationId) public view returns (address) {
    address owner = attestationOwner[_attestationId];
    require(owner != address(0));
    return owner;
  }

  /**
   * @dev Returns an URI for a given attestation ID
   * Throws if the attestation ID does not exist. May return an empty string.
   * @param _attestationId uint256 ID of the attestation to query
   */
  function attestationURI(uint256 _attestationId) public view returns (string) {
    require(exists(_attestationId));
    return attestationURIs[_attestationId];
  }

  /**
   * @dev Returns the statke for a given attestation ID.
   * Throws if the attestation ID does not exist. May return 0.
   * @param _attestationId uint256 ID of the attestation to query
   */
  function stakeOfAttestation(
    uint256 _attestationId
  ) public view returns (uint256) {
    require(exists(_attestationId));
    return attestationStake[_attestationId];
  }

  /**
   * @dev Internal function to set the attestation URI for a given attestation
   * Reverts if the attestation ID does not exist
   * @param _attestationId uint256 ID of the attestation to set its URI
   * @param _uri string URI to assign
   */
  function _setAttestationURI(uint256 _attestationId, string _uri) internal {
    require(exists(_attestationId));
    attestationURIs[_attestationId] = _uri;
  }

  function setStake(uint256 _newStake) external onlyOwner {
    minimumStake = _newStake;
  }

  function withdraw(uint256 _attestationId) external {
    require(exists(_attestationId));
    require(ownerOf(_attestationId) == msg.sender);

    uint256 lastAttestation = allAttestations.length.sub(1);
    allAttestations[_attestationId] = lastAttestation;
    allAttestations[allAttestations.length.sub(1)] = 0;
    allAttestations.length--;

    uint256 tokenId = attestationToken[_attestationId];
    uint256 stake = attestationStake[_attestationId];
    attestationOwner[_attestationId] = address(0);
    delete attestationToken[_attestationId];
    delete attestationStake[_attestationId];
    delete attestationURIs[_attestationId];
    msg.sender.transfer(stake);
    emit Withdraw(msg.sender, _attestationId, tokenId);
  }

  function create(
    uint256 _tokenId,
    string _attestationURI
  ) external payable {
    // Minimum stake is 0.01 Ether
    require(msg.value >= minimumStake);

    uint256 attestationId = totalSupply();
    allAttestations.push(attestationId);
    attestationOwner[attestationId] = msg.sender;
    attestationToken[attestationId] = _tokenId;
    attestationStake[attestationId] = msg.value;
    _setAttestationURI(attestationId, _attestationURI);
    emit Create(msg.sender, attestationId, _tokenId);
  }
}
