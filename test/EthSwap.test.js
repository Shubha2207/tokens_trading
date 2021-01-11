const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')


require('chai').use(require('chai-as-promised')).should()

function tokens(n){
	return web3.utils.toWei(n, 'ether')
}


//first and second address from the accounts list are
//basically deployer and investor

contract('EthSwap', ([deployer, investor]) => {

	let token, ethSwap

	before(async () => {
		token = await Token.new()
		ethSwap = await EthSwap.new(token.address)
		//Transfer all tokens to EthSwap
		await token.transfer(ethSwap.address, tokens('1000000'))
	})

	describe('Token deployment', async () => {
		it('contract has a name', async () => {
			//let token = await Token.new()
			const name = await token.name()
			assert.equal(name,'DApp Token')
		})
	})

	describe('EthSwap deployment', async () => {
		it('contract has a name', async () => {
			//let ethSwap = await EthSwap.new()
			const name = await ethSwap.name()
			assert.equal(name, 'EthSwap Instant Exchange')
		})

		it('contract has tokens', async () => {
			//let token = await Token.new()
			//let ethSwap = await EthSwap.new()
			//await token.transfer(ethSwap.address,'1000000000000000000000000')
			let balance = await token.balanceOf(ethSwap.address)
			assert.equal(balance.toString(), tokens('1000000'))
		})


	})




	describe('buyTokens()', async () => {
		let result

		before(async () => {
			result = await ethSwap.buyTokens({from : investor, value: web3.utils.toWei('1','ether')})
		})

		it('Allows user to instantly purchase token from ethSwap for a fixed price', async () => {
			//await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('10', 'ether')})

			//check investor token balance after purchase
			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('100'))


			//Check ethSwap balance(No.of tokens) after purchase
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('999900'))

			//Check ethSwap balance(No. of ethers) after purchase
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1','ether'))

			//console.log(result.logs[0].args)

			//Check logs to ensure event was emitted with correct data
			const event = result.logs[0].args
			assert.equal(event.account, investor)
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('100').toString())
			assert.equal(event.rate.toString(),'100')

		})
	})


	describe('sellTokens()', async () => {
		let result

		before(async () => {
			// Investor must appove tokens before the purchase
			await token.approve(ethSwap.address, tokens('100'), {from : investor})
			// Investor sell the tokens
			result = await ethSwap.sellTokens(tokens('100'),{from: investor})
		})

		it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {

			//Check investor token balance after purchase
			let investorBalance = await token.balanceOf(investor)
			assert.equal(investorBalance.toString(), tokens('0'))


			//check ethSwap token balance after purchase
			let ethSwapBalance
			ethSwapBalance = await token.balanceOf(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), tokens('1000000'))

			//check ethSwap ether balane
			ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
			assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0','ether'))

			//Check logs to ensure event was emitted with correct data
			const event = result.logs[0].args

			assert.equal(event.account, investor)
			assert.equal(event.token, token.address)
			assert.equal(event.amount.toString(), tokens('100').toString())
			assert.equal(event.rate.toString(),'100')


			// FAILURE : Investor can't sell more tokens than he/she has 
			await ethSwap.sellTokens(tokens('500'),{ from : investor}).should.be.rejected;

			
		})
	})

})