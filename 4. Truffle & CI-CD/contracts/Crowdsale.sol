// SPDX-License-Identifier: MIT

pragma solidity 0.8.18;
 
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
 
contract ERC20Token is ERC20 {
   constructor(uint256 initialSupply) ERC20("ALYRA", "ALY") {
       _mint(msg.sender, initialSupply);
   }
}
 
contract Crowdsale {
    uint public rate = 200;

    ERC20Token public token;
    constructor(uint256 initialSupply) {
        token = new ERC20Token(initialSupply);
    }
    
    receive() external payable {
        require(msg.value >= 0.1 ether, "you can't send less than 0.1 ether");
        distribute(msg.value);
    }
    
    function distribute(uint256 amount) internal {
        uint256 tokensToSent = amount * rate;
        
        token.transfer(msg.sender, tokensToSent);
    }
}