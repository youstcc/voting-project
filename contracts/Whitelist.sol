
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Whitelist is Ownable {
    mapping(address => bool) private whitelistedAddresses;

    event AddressAdded(address indexed _address);
    event AddressRemoved(address indexed _address);

    constructor() Ownable(msg.sender) { }  // 

    function addAddressToWhitelist(address _address) external onlyOwner {
        require(!whitelistedAddresses[_address], "already used address");
        whitelistedAddresses[_address] = true;
        emit AddressAdded(_address);
    }

    function removeAddressFromWhitelist(address _address) external onlyOwner {
        require(whitelistedAddresses[_address], unicode"Adresse non trouvée !"); 
        whitelistedAddresses[_address] = false;
        emit AddressRemoved(_address);
    }

    function isWhitelisted(address _address) external view returns (bool) {
        return whitelistedAddresses[_address];
    }
}

