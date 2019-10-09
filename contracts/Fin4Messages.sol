pragma solidity ^0.5.0;

import 'contracts/stub/Fin4BaseProofTypeStub.sol';

contract Fin4Messages {

  enum MessageType { INFO, APPROVAL } // diferent types of message types, determine how they get rendered in the front end

  struct Message {
    uint messageType; // is an Enum in Fin4BaseProofType
    address sender;
    address receiver;
    string message;
    address fulfillmentAddress; // where to go and do something
    bool hasBeenActedUpon;
    string attachment;
    uint pendingApprovalId;
  }

  mapping (address => Message[]) public messages;

  function addMessage(address sender, address receiver, string memory message) public returns(uint) {
    Message memory m;
    m.messageType = uint(MessageType.INFO);
    m.sender = sender;
    m.receiver = receiver;
    m.message = message;
    messages[receiver].push(m);
    return messages[receiver].length - 1;
  }

  function addPendingApprovalMessage(address sender, address receiver, string memory message,
    address fulfillmentAddress, string memory attachment, uint pendingApprovalId) public returns(uint) {
    Message memory m = Message(uint(MessageType.APPROVAL), sender, receiver, message, fulfillmentAddress, false, attachment, pendingApprovalId);
    messages[receiver].push(m);
    return messages[receiver].length - 1;
  }

  function getMyMessagesCount() public view returns(uint) {
    return messages[msg.sender].length;
  }

  // have to get messages one by one because returning string arrays is not possible
  function getMyMessage(uint index) public view returns(uint, address, string memory, address, string memory, bool, string memory, uint) {
    Message memory m = messages[msg.sender][index];
    return (m.messageType, m.sender, m.message, m.fulfillmentAddress,
      Fin4BaseProofTypeStub(m.fulfillmentAddress).getName(), m.hasBeenActedUpon, m.attachment, m.pendingApprovalId);
  }

  // after a picture is approved for instance, the message doesn't need to be shown to the approver anymore
  function markMessageAsActedUpon(address approver, uint messageId) public {
    messages[approver][messageId].hasBeenActedUpon = true;
  }

}
