pragma solidity ^0.4.23;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./strings.sol";

contract COALAIPRight is ERC721Token {
  using strings for *;

  constructor (string _name, string _symbol) public
    ERC721Token(_name, _symbol)
  {
  }

  // Taken from:
  // https://github.com/Arachnid/solidity-stringutils#splitting-a-string-into-an-array
  function stringToArray(string _s) internal pure returns (string[]) {
    var s = _s.toSlice();
    var delim = ",".toSlice();
    var parts = new string[](s.count(delim) + 1);
    for(uint i = 0; i < parts.length; i++) {
          parts[i] = s.split(delim).toString();
    }
    return parts;
  }

  // Taken from: https://github.com/oraclize/ethereum-api
  function parseAddr(string _a) internal pure returns (address){
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint i=2; i<2+2*20; i+=2){
            iaddr *= 256;
            b1 = uint160(tmp[i]);
            b2 = uint160(tmp[i+1]);
            if ((b1 >= 97)&&(b1 <= 102)) b1 -= 87;
            else if ((b1 >= 48)&&(b1 <= 57)) b1 -= 48;
            if ((b2 >= 97)&&(b2 <= 102)) b2 -= 87;
            else if ((b2 >= 48)&&(b2 <= 57)) b2 -= 48;
            iaddr += (b1*16+b2);
        }
        return address(iaddr);
    }

  function mint(
    string _tos,
    string  _tokenURIs
  ) public
  {
    string[] memory tosArray = stringToArray(_tos);
    string[] memory tokenURIsArray = stringToArray(_tokenURIs);

    for (uint i = 0; i < tosArray.length; i++) {
      address to = parseAddr(tosArray[i]);
      string memory tokenURI = tokenURIsArray[i];
      uint rightId = totalSupply();
      super._mint(to, rightId);
      super._setTokenURI(rightId, tokenURI);
    }
  }

  function transferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  ) public {
    revert("Based on the underlying license of this token, this method isn't allowed to be executed.");
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId,
    bytes data
  ) public {
    revert("Based on the underlying license of this token, this method isn't allowed to be executed.");
  }

  function safeTransferFrom(
    address _from,
    address _to,
    uint256 _tokenId
  ) public {
    revert("Based on the underlying license of this token, this method isn't allowed to be executed.");
  }

  function approve(address _approved, uint256 _tokenId) public {
    revert("Based on the underlying license of this token, this method isn't allowed to be executed.");
  }

  function setApprovalForAll(address _operator, bool _approved) public {
    revert("Based on the underlying license of this token, this method isn't allowed to be executed.");
  }
}
