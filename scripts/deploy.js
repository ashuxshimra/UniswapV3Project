const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Get the current gas price
  let gasPrice = await hre.ethers.provider.getGasPrice();
  console.log("Current gas price:", gasPrice.toString());

  // Increase gas price by 50%
  gasPrice = gasPrice.mul(150).div(100);
  console.log("Using gas price:", gasPrice.toString());

  const deployOptions = {
    gasPrice: gasPrice,
    gasLimit: 5000000 // Adjust this value as needed
  };

  // BooToken
//   const BooToken = await hre.ethers.getContractFactory("BooToken");
//   const booToken = await BooToken.deploy(deployOptions);
//   await booToken.deployed();
//   console.log(`BooToken deployed to ${booToken.address}`);

  // LifeToken
//   const LifeToken = await hre.ethers.getContractFactory("LifeToken");
//   const lifeToken = await LifeToken.deploy(deployOptions);
//   await lifeToken.deployed();
//   console.log(`LifeToken deployed to ${lifeToken.address}`);

  // SingleSwapToken
  const SingleSwapToken = await hre.ethers.getContractFactory("SingleSwapToken");
  const singleSwapToken = await SingleSwapToken.deploy(deployOptions);
  await singleSwapToken.deployed();
  console.log(`SingleSwapToken deployed to ${singleSwapToken.address}`);

  // SwapMultiHop
//   const SwapMultiHop = await hre.ethers.getContractFactory("SwapMultiHop");
//   const swapMultiHop = await SwapMultiHop.deploy(deployOptions);
//   await swapMultiHop.deployed();
//   console.log(`swapMultiHop deployed to ${swapMultiHop.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });