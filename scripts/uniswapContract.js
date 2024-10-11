const { ContractFactory, utils } = require("ethers");
const WETH9 = require("../Context/WETH9.json");

const fs = require("fs");
const { promisify } = require("util");

console.log("---1");

const artifacts = {
  UniswapV3Factory: require("@uniswap/v3-core/artifacts/contracts/UniswapV3Factory.sol/UniswapV3Factory.json"),
  SwapRouter: require("@uniswap/v3-periphery/artifacts/contracts/SwapRouter.sol/SwapRouter.json"),
  NFTDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/libraries/NFTDescriptor.sol/NFTDescriptor.json"),
  NonfungibleTokenPositionDescriptor: require("@uniswap/v3-periphery/artifacts/contracts/NonfungibleTokenPositionDescriptor.sol/NonfungibleTokenPositionDescriptor.json"),
  NonfungiblePositionManager: require("@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"),
  WETH9,
};

console.log("---2");

const linkLibraries = ({ bytecode, linkReferences }, libraries) => {
  Object.keys(linkReferences).forEach((fileName) => {
    Object.keys(linkReferences[fileName]).forEach((contractName) => {
      if (!libraries.hasOwnProperty(contractName)) {
        throw new Error(`Missing link library name ${contractName}`);
      }
      const address = utils
        .getAddress(libraries[contractName])
        .toLowerCase()
        .slice(2);
      linkReferences[fileName][contractName].forEach(({ start, length }) => {
        const start2 = 2 + start * 2;
        const length2 = length * 2;
        bytecode = bytecode
          .slice(0, start2)
          .concat(address)
          .concat(bytecode.slice(start2 + length2, bytecode.length));
      });
    });
  });
  return bytecode;
};

console.log("---3");

async function main() {
  const [owner] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", owner.address);

  // Deploy WETH
  const Weth = new ContractFactory(artifacts.WETH9.abi, artifacts.WETH9.bytecode, owner);
  const weth = await Weth.deploy();
  await weth.deployed();
  console.log("WETH deployed to:", weth.address);

  // Deploy Factory
  const Factory = new ContractFactory(artifacts.UniswapV3Factory.abi, artifacts.UniswapV3Factory.bytecode, owner);
  const factory = await Factory.deploy();
  await factory.deployed();
  console.log("Factory deployed to:", factory.address);

  // Deploy SwapRouter
  const SwapRouter = new ContractFactory(artifacts.SwapRouter.abi, artifacts.SwapRouter.bytecode, owner);
  const swapRouter = await SwapRouter.deploy(factory.address, weth.address);
  await swapRouter.deployed();
  console.log("SwapRouter deployed to:", swapRouter.address);

  // Deploy NFTDescriptor
  const NFTDescriptor = new ContractFactory(artifacts.NFTDescriptor.abi, artifacts.NFTDescriptor.bytecode, owner);
  const nftDescriptor = await NFTDescriptor.deploy();
  await nftDescriptor.deployed();
  console.log("NFTDescriptor deployed to:", nftDescriptor.address);

  console.log("---4");

  // Link and deploy NonfungibleTokenPositionDescriptor
  const linkedBytecode = linkLibraries(
    {
      bytecode: artifacts.NonfungibleTokenPositionDescriptor.bytecode,
      linkReferences: artifacts.NonfungibleTokenPositionDescriptor.linkReferences,
    },
    {
      NFTDescriptor: nftDescriptor.address,
    }
  );

  const NonfungibleTokenPositionDescriptor = new ContractFactory(
    artifacts.NonfungibleTokenPositionDescriptor.abi,
    linkedBytecode,
    owner
  );

  // Deploy NonfungibleTokenPositionDescriptor with only WETH address
  console.log("Deploying NonfungibleTokenPositionDescriptor with WETH address:", weth.address);
  const nonfungibleTokenPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(weth.address);
  await nonfungibleTokenPositionDescriptor.deployed();
  console.log("NonfungibleTokenPositionDescriptor deployed to:", nonfungibleTokenPositionDescriptor.address);

  // Deploy NonfungiblePositionManager
  const NonfungiblePositionManager = new ContractFactory(
    artifacts.NonfungiblePositionManager.abi,
    artifacts.NonfungiblePositionManager.bytecode,
    owner
  );
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
    factory.address,
    weth.address,
    nonfungibleTokenPositionDescriptor.address
  );
  await nonfungiblePositionManager.deployed();
  console.log("NonfungiblePositionManager deployed to:", nonfungiblePositionManager.address);

  console.log("---5");

  // Write addresses to .env file
  const addresses = [
    `WETH_ADDRESS=${weth.address}`,
    `FACTORY_ADDRESS=${factory.address}`,
    `SWAP_ROUTER_ADDRESS=${swapRouter.address}`,
    `NFT_DESCRIPTOR_ADDRESS=${nftDescriptor.address}`,
    `POSITION_DESCRIPTOR_ADDRESS=${nonfungibleTokenPositionDescriptor.address}`,
    `POSITION_MANAGER_ADDRESS=${nonfungiblePositionManager.address}`,
  ];
  const data = addresses.join("\n");

  const writeFile = promisify(fs.writeFile);
  const filePath = ".env";
  await writeFile(filePath, data);
  console.log("Addresses recorded in .env file");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });