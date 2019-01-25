pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract COALAIPRight is ERC721Token, Ownable {

  string public IPFSProvider;

  constructor (string _name, string _symbol, string _IPFSProvider) public
    ERC721Token(_name, _symbol)
  {
    IPFSProvider = _IPFSProvider;
  }

  function setIPFSProvider(string _IPFSProvider) public onlyOwner {
    IPFSProvider = _IPFSProvider;
  }

  function split(
      bytes _ipfsHashes
    ) internal pure returns (bytes[])
    {
      uint numColons = 0;
      for (uint i = 0; i < _ipfsHashes.length; i++) {
          if (_ipfsHashes[i] == 0x3a) {
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
