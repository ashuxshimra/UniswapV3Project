const { expect } = require("chai");
const { ethers } = require("hardhat");

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DAI_WHALE = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
const USDC_WHALE = "0x55FE002aefF02F77364de339a1292923A15844B8";
const ETH_WHALE = "0x00000000219ab540356cBB839Cbe05303d7705Fa"; // Ethereum 2.0 Deposit Contract

describe("LiquidityExamples", () => {
  let liquidityExamples;
  let accounts;
  let dai;
  let usdc;

  before(async () => {
    accounts = await ethers.getSigners(1);

    // Deploy the contract
    const LiquidityExamples = await ethers.getContractFactory("LiquidityExamples");
    liquidityExamples = await LiquidityExamples.deploy();
    await liquidityExamples.deployed();

    // Get token contracts
    dai = await ethers.getContractAt("IERC20", DAI);
    usdc = await ethers.getContractAt("IERC20", USDC);

    // Impersonate accounts
    await network.provider.request({ method: "hardhat_impersonateAccount", params: [DAI_WHALE] });
    await network.provider.request({ method: "hardhat_impersonateAccount", params: [USDC_WHALE] });
    await network.provider.request({ method: "hardhat_impersonateAccount", params: [ETH_WHALE] });

    const daiWhale = await ethers.getSigner(DAI_WHALE);
    const usdcWhale = await ethers.getSigner(USDC_WHALE);
    const ethWhale = await ethers.getSigner(ETH_WHALE);

    // Fund the test account with ETH
    await ethWhale.sendTransaction({
      to: accounts[0].address,
      value: ethers.utils.parseEther("10"), // Send 10 ETH
    });

    // Transfer DAI and USDC to the test account
    const daiAmount = ethers.utils.parseUnits("20000", 18);
    const usdcAmount = ethers.utils.parseUnits("20000", 6);
    
    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount);
    await usdc.connect(usdcWhale).transfer(accounts[0].address, usdcAmount);

    // Log balances
    console.log("ETH balance:", ethers.utils.formatEther(await ethers.provider.getBalance(accounts[0].address)));
    console.log("DAI balance:", ethers.utils.formatUnits(await dai.balanceOf(accounts[0].address), 18));
    console.log("USDC balance:", ethers.utils.formatUnits(await usdc.balanceOf(accounts[0].address), 6));
  });

  it("mintNewPosition", async () => {
    const daiAmount = ethers.utils.parseUnits("10000", 18);
    const usdcAmount = ethers.utils.parseUnits("10000", 6);

    await dai.connect(accounts[0]).approve(liquidityExamples.address, daiAmount);
    await usdc.connect(accounts[0]).approve(liquidityExamples.address, usdcAmount);

    await liquidityExamples.mintNewPosition();

    const tokenId = await liquidityExamples.tokenId();
    expect(tokenId).to.be.gt(0, "No new position was minted");

    console.log("New position minted with token ID:", tokenId.toString());
  });
});