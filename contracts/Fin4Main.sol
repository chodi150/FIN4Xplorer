pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import 'contracts/Fin4Token.sol';
import 'contracts/proof/Fin4BaseProofType.sol';

contract Fin4Main {

  address[] public children;

	function createNewToken(string memory name, string memory symbol, uint8 decimals) public returns(address) {
    Fin4Token newToken = new Fin4Token(name, symbol, decimals, address(this), msg.sender);

    // TODO use a "address[] memory requiredProofTypes" argument instead

    for (uint i = 0; i < 2; i++) {
      newToken.addRequiredProofType(proofTypes[i]);
    }

    children.push(address(newToken));
    return address(newToken);
  }

  function getChildren() public view returns(address[] memory) {
    return children;
  }

  function transferTokens(address tokenAddress, address recepient) public {
      Fin4Token token = Fin4Token(tokenAddress);
      token.transferFrom(msg.sender,recepient,1);
  }

  function mintToken(address tokenAddress,uint256 amount) public {
      Fin4Token token = Fin4Token(tokenAddress);
      token.mint(msg.sender,amount);
  }

  function getBalance(address tokenAddress) public view returns(uint256) {
      return Fin4Token(tokenAddress).balanceOf(msg.sender);
  }

  function getAllTokenBalance() public view returns(address[] memory, uint256[] memory) {
    uint count = 0;
    for (uint i = 0; i < children.length; i ++) {
      // if (Fin4Token(children[i]).balanceOf(msg.sender) != 0) {
          count ++;
      // }
    }
    uint[] memory balances = new uint[](count);
    address[] memory addresses = new address[](count);

    uint256 j = 0;
    for (uint i = 0; i < children.length; i++) {
      Fin4Token tok = Fin4Token(children[i]);
      // uint256 bal = tok.balanceOf(msg.sender);
      // if (bal != 0) {
      balances[j] = tok.balanceOf(msg.sender);
      addresses[j] = address(tok);
      j++;
      // }
    }

    return (addresses, balances);
  }

  /*function _hasChild(address child) private returns (bool) {
    for (uint i = 0; i < children.length; i++) {
      if (children[i] == child) {
        return true;
      }
    }
    return false;
  }*/

  function _userClaimedOnThisActionAlready(address user, address action) private returns (bool) {
    for (uint i = 0; i < actionsWhereUserHasClaims[user].length; i++) {
      if (actionsWhereUserHasClaims[user][i] == action) {
        return true;
      }
    }
    return false;
  }

  function getActionsWhereUserHasClaims() public view returns(address[] memory) {
    return actionsWhereUserHasClaims[msg.sender];
  }

  function claimSubmissionPingback(address claimer) public returns(bool) {
    if (!_userClaimedOnThisActionAlready(claimer, msg.sender)) {
      actionsWhereUserHasClaims[claimer].push(msg.sender);
    }
  }

  mapping (address => address[]) public actionsWhereUserHasClaims; // key = user, value = action addresses

  address[] public proofTypes;

  function addProofType(address proofType) public returns(bool) {
    proofTypes.push(proofType);
    return true;
  }

  function getProofTypes() public view returns(address[] memory) {
    return proofTypes;
  }

  function getProofTypeInfo(address proofType) public view returns(address, string memory, string memory) {
      require(proofTypeIsRegistered(proofType), "Address is not registered as proof type on Fin4Main");
      return (proofType, Fin4BaseProofType(proofType).getName(), Fin4BaseProofType(proofType).getDescription());
  }

  // called from Fin4Token instances to ensure the required proof types there are a subset of the proofTypes here
  function proofTypeIsRegistered(address proofTypeToCheck) public view returns(bool) {
    for (uint i = 0; i < proofTypes.length; i++) {
      if (proofTypes[i] == proofTypeToCheck) {
        return true;
      }
    }
    return false;
  }

}
