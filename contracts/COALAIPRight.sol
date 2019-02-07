pragma solidity ^0.4.23;

import "./lib/openzeppelin-solidity/token/ERC721/ERC721Token.sol";
import "./lib/openzeppelin-solidity/ownership/Ownable.sol";
import "./lib/kleros/Arbitrator.sol";

contract COALAIPRight is ERC721Token, Ownable {

  enum Status {Created, Resolved}

  struct RightsConflict {
    uint256 disputeID;
    uint256 tokenID;
    address prosecutor;
    address defendant;
    uint256 arbitrationCost;
    Status status;
  }
  RightsConflict[] public rightConflicts;
  mapping(uint => uint) public disputeIDtoRightsConflictID;

  uint8 constant AMOUNT_OF_CHOICES = 1;
  uint8 constant PROSECUTOR_WINS = 0;
  uint8 constant DEFENDANT_WINS = 1;
  uint256 public timeout;
  bytes public extraData;
  Arbitrator public arbitrator;

  string public IPFSProvider;

  /** @dev To be emitted when a dispute is created to link the correct
   *  meta-evidence to the disputeID.
   *  @param _arbitrator The arbitrator of the contract.
   *  @param _disputeID ID of the dispute in the Arbitrator contract.
   *  @param _metaEvidenceID Unique identifier of meta-evidence. Should be the
   *  transactionID.
   */
  event Dispute(
    Arbitrator indexed _arbitrator,
    uint indexed _disputeID,
    uint _metaEvidenceID
  );

  /** @dev To be raised when a ruling is given.
   *  @param _arbitrator The arbitrator giving the ruling.
   *  @param _disputeID ID of the dispute in the Arbitrator contract.
   *  @param _ruling The ruling which was given.
   */
  event Ruling(
    Arbitrator indexed _arbitrator,
    uint indexed _disputeID,
    uint _ruling
  );

  constructor (
    string _name,
    string _symbol,
    string _IPFSProvider,
    address _arbitrator,
    bytes _extraData,
    uint _timeout
  ) public
    ERC721Token(_name, _symbol)
  {
    IPFSProvider = _IPFSProvider;
    arbitrator = Arbitrator(_arbitrator);
    extraData = _extraData;
    timeout = _timeout;
  }

  function setIPFSProvider(string _IPFSProvider) public onlyOwner {
    IPFSProvider = _IPFSProvider;
  }

  function setArbitrator(address _arbitrator) public onlyOwner {
    arbitrator = Arbitrator(_arbitrator);
  }

  // TODO: Currently there can be two or more disputes for a single token
  function raiseDispute(uint _tokenID) public payable {
    uint arbitrationCost = arbitrator.arbitrationCost(extraData);  
    address currentOwner = super.ownerOf(_tokenID);

    // Check if _tokenID exists
    require(currentOwner != address(0));
    // Check if token is currently already disputed
    require(currentOwner != address(this));
    // Make sure that currentOwner isn't raising a dispute on own token
    require(currentOwner != msg.sender);
    // Check whether the arbitrationCost was sent
    require(msg.value == arbitrationCost);


    uint256 disputeID = arbitrator.createDispute.value(arbitrationCost)(
      AMOUNT_OF_CHOICES, 
      extraData 
    );

    uint rightsConflictID = rightConflicts.push(RightsConflict({
      disputeID: disputeID,
      tokenID: _tokenID,
      prosecutor: msg.sender,
      defendant: currentOwner,
      arbitrationCost: arbitrationCost,
      status: Status.Created
    })) - 1;

    // Map disputeID to rightsConflictID
    disputeIDtoRightsConflictID[disputeID] = rightsConflictID;

    // Approving to transfer the _tokenID to msg.sender
    super.approveFor(msg.sender, _tokenID);
    // Transferring to the contract until dispute is settled
    super.transferFrom(currentOwner, address(this), _tokenID);

    emit Dispute(arbitrator, disputeID, _tokenID);
  }

  function rule(uint _dispute, uint _ruling) public {
    executeRuling(_dispute, _ruling);
    emit Ruling(Arbitrator(msg.sender), _dispute, _ruling);
  }

  function executeRuling(uint _disputeID, uint _ruling) internal {
    uint rightsConflictID = disputeIDtoRightsConflictID[_disputeID];
    RightsConflict storage rightsConflict = rightConflicts[rightsConflictID];
    // Make sure the executor is the arbitrator
    require(msg.sender == address(arbitrator));
    // Make sure the ruling is in the set of possible rulings
    require(_ruling <= AMOUNT_OF_CHOICES);
    // Make sure there is a dispute for the token and it's status is unresolved
    require(rightsConflict.status == Status.Created);

    if (_ruling == PROSECUTOR_WINS) {
      // Destroy the token
      super._burn(address(this), rightsConflict.tokenID);
      rightsConflict.status = Status.Resolved;
    } else if (_ruling == DEFENDANT_WINS) {
      // Approve arbitrator to transfer the token on behalf of this contract
      super.approveFor(msg.sender, rightsConflict.tokenID);
      // Transfer token back to defendant
      super.transferFrom(
        address(this), 
        rightsConflict.defendant,
        rightsConflict.tokenID
      );
      rightsConflict.status = Status.Resolved;
    } else {
      // This should never happen
      revert();
    }
  }

  function mint(
    address[] _tos,
    bytes _ipfsHashes
  ) public
  {
    bytes[] memory hashes = split(_ipfsHashes);
    require(_tos.length == hashes.length);
    for (uint i = 0; i < hashes.length; i++) {
        string memory ipfsHash = string(hashes[i]);
        string memory tokenURI = string(abi.encodePacked(IPFSProvider, ipfsHash));
        uint rightID = totalSupply();
        super._mint(_tos[i], rightID);
        super._setTokenURI(rightID, tokenURI);
    }
  }

  function split(
      bytes _ipfsHashes
    ) internal pure returns (bytes[])
    {
      uint numColons = 0;
      for (uint i = 0; i < _ipfsHashes.length; i++) {
          if (_ipfsHashes[i] == 0x3a) { // bytes(":")
              numColons++;
          }
      }
      bytes[] memory hashes = new bytes[](numColons+1);
      uint ptr = 0;
      uint countHashes = 0;
      uint startPtr = ptr;
      uint end = _ipfsHashes.length;
      
      while (ptr <= end) {
          if (ptr == end || _ipfsHashes[ptr] == bytes1(":")) {
              bytes memory hash = new bytes(ptr - startPtr);
              for (uint j = startPtr; j < ptr; j++) {
                  hash[j-startPtr] = _ipfsHashes[j];
              }
              hashes[countHashes] = hash;
              countHashes++;
              startPtr = ptr+1;
          }
          ptr++;
      }
      
      return hashes;
    }
}
