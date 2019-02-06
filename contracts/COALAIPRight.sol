pragma solidity ^0.4.23;

import "./lib/openzeppelin-solidity/token/ERC721/ERC721Token.sol";
import "./lib/openzeppelin-solidity/ownership/Ownable.sol";
import "./lib/kleros/Arbitrator.sol";

contract COALAIPRight is ERC721Token, Ownable {

  uint8 constant AMOUNT_OF_CHOICES = 2;

  string public IPFSProvider;
  uint256 public timeout;
  bytes public extraData;
  Arbitrator public arbitrator;

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

  function raiseDispute(uint256 _tokenId) public payable {
    uint arbitrationCost = arbitrator.arbitrationCost(extraData);  
    address currentOwner = super.ownerOf(_tokenId);

    // Check if _tokenId exists
    require(currentOwner != address(0));
    require(currentOwner != msg.sender);
    // Check whether the arbitrationCost was sent
    require(msg.value == arbitrationCost);

    uint256 disputeId = arbitrator.createDispute.value(arbitrationCost)(
      AMOUNT_OF_CHOICES, 
      extraData 
    );

    // Approving to transfer the _tokenId to msg.sender
    super.approveFor(msg.sender, _tokenId);
    // Transferring to the contract until dispute is settled
    super.transferFrom(currentOwner, address(this), _tokenId);

    emit Dispute(arbitrator, disputeId, _tokenId);
  }

  function executeRuling(uint _disputeID, uint _ruling) internal {
    _disputeID;
    _ruling;
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
        uint rightId = totalSupply();
        super._mint(_tos[i], rightId);
        super._setTokenURI(rightId, tokenURI);
    }
  }
}
