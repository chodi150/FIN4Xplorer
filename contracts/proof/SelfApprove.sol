pragma solidity ^0.5.0;

import "contracts/proof/Fin4BaseProofType.sol";

contract SelfApprove is Fin4BaseProofType {

  constructor(address Fin4MessagingAddress)
    Fin4BaseProofType(Fin4MessagingAddress)
    public {
      name = "SelfApprove";
      description = "Claimers approve their own claim.";
    }

    function submitProof(address tokenAddrToReceiveProof, uint claimId) public {
      _sendApproval(address(this), tokenAddrToReceiveProof, claimId);
    }

}
