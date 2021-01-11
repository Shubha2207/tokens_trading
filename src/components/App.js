import React, { Component } from 'react';
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css';

const Web3 = require("web3");

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    //console.log(accounts[0])
    this.setState({account : accounts[0]})
    //console.log(this.state.account)
    //0x7b4d8c2B91CE8F768a49f1102214aB414aCc40d1

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ethBalance : ethBalance})
    //console.log(this.state.ethBalance)


    //Load Token
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({token : token})

      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({tokenBalance : tokenBalance.toString()})

    }else{
      window.alert('Token contract not deployed to detected network')
    }


    //Load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      console.log(ethSwap._address)
      this.setState({ethSwap : ethSwap})
    }else{
      window.alert('EthSwap contract not deployed to detected network')
    }

    //Everything is loaded
    this.setState({loading: false})
  }
  

  loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
    //console.log(window.web3);
    return true;
  }
  return false;
}
/*
  async componentWillMount() {
    await this.loadWeb3()
    console.log(window.web3)
  }

  async loadWeb3() {
     // Wait for loading completion to avoid race conditions with web3 injection timing.
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        // try {
        //   // Request account access if needed
        //   await window.ethereum.enable();
        //   // Acccounts now exposed
        //   return web3;
        // } catch (error) {
        //   console.error(error);
        // }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        window.web3 = new Web3(window.web3.currentProvider)
        // const web3 = window.web3;
        // console.log('Injected web3 detected.');
        // return web3;
      }
      // Fallback to localhost; use dev console port by default...
      else {
        // const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
        // const web3 = new Web3(provider);
        // console.log('No web3 instance injected, using Local web3.');
        // return web3;
        window.alert('Non-Ethereum browser detected.')
      }
}*/



  buyTokens = (etherAmount) => {
    this.setState({loading: true})
    this.state.ethSwap.methods.buyTokens()
                              .send({value: etherAmount, from : this.state.account})
                              .on('transactionHash',(hash) => {
          this.setState({loading: false})
          window.location.reload()
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap._address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
        window.location.reload()
      })
    })
  }
  

  constructor(props){
      super(props)
      this.state = {
        account : '',
        token : {},
        ethSwap : {},
        ethBalance : '0',
        tokenBalance : '0',
        loading : true
      }
    }
  

  

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    }else{
      content = <Main 
        ethBalance={this.state.ethBalance}
        tokenBalance={this.state.tokenBalance}
        buyTokens = {this.buyTokens}
        sellTokens = {this.sellTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}                
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
