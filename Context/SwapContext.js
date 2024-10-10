import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import Web3Modal from "web3modal";
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core";
import axios from "axios";

//INTERNAL IMPORT
import {
  checkIfWalletConnected,
  connectWallet,
  connectingWithBooToken,
  connectingWithLIfeToken,
  connectingWithSingleSwapToken,
  connectingWithIWTHToken,
  connectingWithDAIToken,
  connectingWithUserStorageContract,
  connectingWithMultiHopContract,
} from "../Utils/appFeatures";

import { getPrice } from "../Utils/fetchingPrice";
import { swapUpdatePrice } from "../Utils/swapUpdatePrice";
import { addLiquidityExternal } from "../Utils/addLiquidity";
import { getLiquidityData } from "../Utils/checkLiquidity";
import { connectingWithPoolContract } from "../Utils/deployPool";

import { IWETHABI } from "./constants";
import ERC20 from "./ERC20.json";

export const SwapTokenContext = React.createContext();

export const SwapTokenContextProvider = ({ children }) => {
  //USSTATE
  const [account, setAccount] = useState("");
  const [ether, setEther] = useState("");
  const [networkConnect, setNetworkConnect] = useState("");
  const [weth9, setWeth9] = useState("");
  const [dai, setDai] = useState("");

  const [tokenData, setTokenData] = useState([]);
  const [getAllLiquidity, setGetAllLiquidity] = useState([]);
  //TOP TOKENS
  const [topTokensList, setTopTokensList] = useState([]);

  const addToken = [
    // "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0x8a6E9a8E0bB561f8cdAb1619ECc4585aaF126D73",
    "0xf09e7Af8b380cD01BD0d009F83a6b668A47742ec", 
  ];

  //FETCH DATA
  const fetchingData = async () => {
    try {
      //GET USER ACCOUNT
      const userAccount = await checkIfWalletConnected();
      setAccount(userAccount);
      //CREATE PROVIDER
      const web3modal = new Web3Modal();
      const connection = await web3modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      //CHECK Balance
      const balance = await provider.getBalance(userAccount);
      const convertBal = BigNumber.from(balance).toString();
      const ethValue = ethers.utils.formatEther(convertBal);
      setEther(ethValue);

      //GET NETWORK
      const newtork = await provider.getNetwork();
      setNetworkConnect(newtork.name);

      //ALL TOKEN BALANCE AND DATA
      addToken.map(async (el, i) => {
        //GETTING CONTRACT
        const contract = new ethers.Contract(el, ERC20, provider);
        //GETTING BALANCE OF TOKEN
        const userBalance = await contract.balanceOf(userAccount);
        const tokenLeft = BigNumber.from(userBalance).toString();
        const convertTokenBal = ethers.utils.formatEther(tokenLeft);
        //GET NAME AND SYMBOL

        const symbol = await contract.symbol();
        const name = await contract.name();

        tokenData.push({
          name: name,
          symbol: symbol,
          tokenBalance: convertTokenBal,
          tokenAddress: el,
        });
      });
    const wethContract = await connectingWithIWTHToken();
    const wethBal = await wethContract.balanceOf(userAccount);
    const wethToken = BigNumber.from(wethBal).toString();
    const convertwethTokenBal = ethers.utils.formatEther(wethToken)
    setWeth9(convertwethTokenBal);

    const daiContract = await connectingWithDAIToken();
    const daiBal = await daiContract.balanceOf(userAccount);
    const daiToken = BigNumber.from(daiBal).toString();
    const convertdaiTokenBal = ethers.utils.formatEther(daiToken)
    setWeth9(convertdaiTokenBal);
    const network = await provider.getNetwork();
    setNetworkConnect(network.name);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchingData();    
  }, []);

//   //CREATE AND ADD LIQUIDITY
//   const createLiquidityAndPool = async ({
//     tokenAddress0,
//     tokenAddress1,
//     fee,
//     tokenPrice1,
//     tokenPrice2,
//     slippage,
//     deadline,
//     tokenAmmountOne,
//     tokenAmmountTwo,
//   }) => {
//     try {
//       console.log(
//         tokenAddress0,
//         tokenAddress1,
//         fee,
//         tokenPrice1,
//         tokenPrice2,
//         slippage,
//         deadline,
//         tokenAmmountOne,
//         tokenAmmountTwo
//       );
//       //CREATE POOL
//       const createPool = await connectingWithPoolContract(
//         tokenAddress0,
//         tokenAddress1,
//         fee,
//         tokenPrice1,
//         tokenPrice2,
//         {
//           gasLimit: 500000,
//         }
//       );

//       const poolAddress = createPool;
//       console.log(poolAddress);

//       //CREATE LIQUIDITY
//       const info = await addLiquidityExternal(
//         tokenAddress0,
//         tokenAddress1,
//         poolAddress,
//         fee,
//         tokenAmmountOne,
//         tokenAmmountTwo
//       );
//       console.log(info);

//       //ADD DATA
//       const userStorageData = await connectingWithUserStorageContract();

//       const userLiqudity = await userStorageData.addToBlockchain(
//         poolAddress,
//         tokenAddress0,
//         tokenAddress1
//       );
//     } catch (error) {
//       console.log(error);
//     }
//   };

const singleSwapToken = async () => {

    try {
      let singleSwapToken;
      let weth;
      let dai;
      singleSwapToken = await connectingWithSingleSwapToken();
      weth = await connectingWithIWTHToken();
      dai = await connectingWithDAIToken();

    //   console.log(singleSwapToken);
    //   const decimals0 = 18;
    //   const inputAmount = swapAmount;
      const amountIn = 10n ** 18n; 

      await weth.deposit({ value: amountIn });
      console.log(amountIn);
      await weth.approve(singleSwapToken.address, amountIn);
      //SWAP
      const transaction = await singleSwapToken.swapExactInputSingle(
        // token1.tokenAddress.tokenAddress,
        // token2.tokenAddress.tokenAddress,
        amountIn,
        {
          gasLimit: 300000,
        }
      );
      await transaction.wait();
    //   console.log(transaction);
      const balance = await dai.balanceOf(account);
      const transferAmount = BigNumber.from(balance).toString();
      const ethValue = ethers.utils.formatEther(transferAmount);
      setDai(ethValue);
      console.log("DAI balance:", ethValue);
    } catch (error) {
      console.log(error);
    }
  };



  //SINGL SWAP TOKEN
//   const singleSwapToken = async ({ token1, token2, swapAmount }) => {
//     console.log(
//       token1.tokenAddress.tokenAddress,
//       token2.tokenAddress.tokenAddress,
//       swapAmount
//     );
//     try {
//       let singleSwapToken;
//       let weth;
//       let dai;
//       singleSwapToken = await connectingWithSingleSwapToken();
//       weth = await connectingWithIWTHToken();
//       dai = await connectingWithDAIToken();

//       console.log(singleSwapToken);
//       const decimals0 = 18;
//       const inputAmount = swapAmount;
//       const amountIn = ethers.utils.parseUnits(
//         inputAmount.toString(),
//         decimals0
//       );

//       await weth.deposit({ value: amountIn });
//       console.log(amountIn);
//       await weth.approve(singleSwapToken.address, amountIn);
//       //SWAP
//       const transaction = await singleSwapToken.swapExactInputSingle(
//         token1.tokenAddress.tokenAddress,
//         token2.tokenAddress.tokenAddress,
//         amountIn,
//         {
//           gasLimit: 300000,
//         }
//       );
//       await transaction.wait();
//       console.log(transaction);
//       const balance = await dai.balanceOf(account);
//       const transferAmount = BigNumber.from(balance).toString();
//       const ethValue = ethers.utils.formatEther(transferAmount);
//       setDai(ethValue);
//       console.log("DAI balance:", ethValue);
//     } catch (error) {
//       console.log(error);
//     }
//   };

  return (
    <SwapTokenContext.Provider
      value={{
        singleSwapToken,
        connectWallet,
        // getPrice,
        // swapUpdatePrice,
        // createLiquidityAndPool,
        // getAllLiquidity,
        account,
        weth9,
        dai,
        networkConnect,
        ether,
        tokenData,
        topTokensList,
      }}
    >
      {children}
    </SwapTokenContext.Provider>
  );
};
