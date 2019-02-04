pragma solidity ^0.4.23;

import "./kleros/Arbitrable.sol";

contract COALAIPArbitrable is Arbitrable {
  uint256 public timeout;
  constructor(
    address _arbitrator,
    bytes _extraData,
    uint _timeout
  ) public
    Arbitrable(_arbitrator, _extraData)
  {
    timeout = _timeout;
  }

  function setArbitrator(address _arbitrator) public {
    super.setArbitrator(_arbitrator);
  }

  function executeRuling(uint _disputeID, uint _ruling) internal {
    _disputeID;
    _ruling;
  }

}
