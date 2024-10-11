require("dotenv").config();
const { Contract, BigNumber } = require("ethers");
const { Token } = require("@uniswap/sdk-core");
const { Pool, Position, nearestUsableTick } = require("@uniswap/v3-sdk");

const SKY_ADDRESS = process.env.SKY_ADDRESS;
const POPUP_ADDRESS = process.env.POPUP_ADDRESS;
const WETH_ADDRESS = process.env.WETH_ADDRESS;
const FACTORY_ADDRESS = process.env.FACTORY_ADDRESS;
const SWAP_ROUTER_ADDRESS = process.env.SWAP_ROUTER_ADDRESS;
const NFT_DESCRIPTOR_ADDRESS = process.env.NFT_DESCRIPTOR_ADDRESS;
const POSITION_DESCRIPTOR_ADDRESS = process.env.POSITION_DESCRIPTOR_ADDRESS;
const POSITION_MANAGER_ADDRESS = process.env.POSITION_MANAGER_ADDRESS;
const SKY_POP_500 = process.env.SKY_POP_500;

const artifacts = {
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  Sky: require("../artifacts/contracts/Sky.sol/Sky.json"),
  PopUp: require("../artifacts/contracts/PopUp.sol/PopUp.json"),
  UniswapV3Pool: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json"),
};

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const [owner] = await ethers.getSigners();
  const provider = ethers.provider;

  console.log("Using account:", owner.address);

  const skyContract = new Contract(SKY_ADDRESS, artifacts.Sky.abi, provider);
  const popupContract = new Contract(POPUP_ADDRESS, artifacts.PopUp.abi, provider);

  // Check balances
  const skyBalance = await skyContract.balanceOf(owner.address);
  const popupBalance = await popupContract.balanceOf(owner.address);
  console.log("SKY balance:", ethers.utils.formatEther(skyBalance));
  console.log("POPUP balance:", ethers.utils.formatEther(popupBalance));

  // Mint tokens if balance is insufficient
  const minRequired = ethers.utils.parseEther("1000");
  if (skyBalance.lt(minRequired)) {
    console.log("Minting SKY tokens...");
    await skyContract.connect(owner).mint(owner.address, minRequired);
  }
  if (popupBalance.lt(minRequired)) {
    console.log("Minting POPUP tokens...");
    await popupContract.connect(owner).mint(owner.address, minRequired);
  }

  // Approve tokens
  const approveAmount = ethers.utils.parseEther("1000");
  await skyContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, approveAmount);
  await popupContract.connect(owner).approve(POSITION_MANAGER_ADDRESS, approveAmount);

  // Check allowances
  console.log("SKY allowance:", ethers.utils.formatEther(await skyContract.allowance(owner.address, POSITION_MANAGER_ADDRESS)));
  console.log("POPUP allowance:", ethers.utils.formatEther(await popupContract.allowance(owner.address, POSITION_MANAGER_ADDRESS)));

  const poolContract = new Contract(SKY_POP_500, artifacts.UniswapV3Pool.abi, provider);
  const poolData = await getPoolData(poolContract);

  const SkyToken = new Token(31337, SKY_ADDRESS, 18, "SKY", "Sky");
  const PopUpToken = new Token(31337, POPUP_ADDRESS, 18, "POP", "PopUpCoin");

  const pool = new Pool(
    SkyToken,
    PopUpToken,
    poolData.fee,
    poolData.sqrtPriceX96.toString(),
    poolData.liquidity.toString(),
    poolData.tick
  );

  const position = new Position({
    pool: pool,
    liquidity: ethers.utils.parseEther("1"),
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
  });

  const { amount0: amount0Desired, amount1: amount1Desired } = position.mintAmounts;

  const params = {
    token0: SKY_ADDRESS,
    token1: POPUP_ADDRESS,
    fee: poolData.fee,
    tickLower: nearestUsableTick(poolData.tick, poolData.tickSpacing) - poolData.tickSpacing * 2,
    tickUpper: nearestUsableTick(poolData.tick, poolData.tickSpacing) + poolData.tickSpacing * 2,
    amount0Desired: amount0Desired.toString(),
    amount1Desired: amount1Desired.toString(),
    amount0Min: 0,
    amount1Min: 0,
    recipient: owner.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  };

  const nonfungiblePositionManager = new Contract(
    POSITION_MANAGER_ADDRESS,
    artifacts.NonfungiblePositionManager.abi,
    provider
  );

  console.log("Minting position...");
  const tx = await nonfungiblePositionManager.connect(owner).mint(params, { gasLimit: "1000000" });
  const receipt = await tx.wait();
  console.log("Transaction hash:", receipt.transactionHash);
  console.log("Position minted successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error in script execution:", error);
    process.exit(1);
  });