pragma solidity ^0.5.0;

import "./Token.sol" ;

contract EthSwap {
	
	string public name = "EthSwap Instant Exchange";
	Token public token;
	uint public rate = 100; // Redemption Rate = No. of tokens for 1 ether


	event TokensPurchased(
		address account,
		address token,
		uint amount,
		uint rate
	);

	event TokensSold(
		address account,
		address token,
		uint amount,
		uint rate
	);


	constructor(Token _token) public{
		token = _token;
	}

	function buyTokens() public payable{
		// Calculate the number of tokens to buy
		// tokenAmount = Amount of Ethereum * Redemption Rate
		uint tokenAmount = msg.value * rate ;

		//Check if EthSwap has enough amount of token
		//if not stop further execution
		require(token.balanceOf(address(this)) >= tokenAmount);


		token.transfer(msg.sender, tokenAmount);

		//Emit an event
		emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
	}



	function sellTokens(uint _amount) public {
		// Investor can't sell more token than the balance
		require(token.balanceOf(msg.sender) >= _amount);


		//calculate the amount of ether to redeem
		uint etherAmount = _amount / rate;

		//check if the EthSwap has enough ether
		require(address(this).balance >= etherAmount);

		//Perform sale
		token.transferFrom(msg.sender, address(this), _amount);

		//this tranfer function is different than the one defined in token.sol code
		//this transfer method is a way to tranfer currency from one contract to another address
		msg.sender.transfer(etherAmount);


		//emit an event
		emit TokensSold(msg.sender, address(token), _amount, rate);

	}

}