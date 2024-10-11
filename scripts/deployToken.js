const fs = require("fs");
const { promisify } = require("util");
//
async function main() {
  const [owner, signer2] = await ethers.getSigners();

  Sky = await ethers.getContractFactory("Sky");
    sky = await Sky.deploy();
  
  
    PopUp = await ethers.getContractFactory("PopUp");
    popUp = await PopUp.deploy();
  
    console.log("SKY_ADDRESS=", `'${sky.address}'`);
    console.log("POPUP_ADDRESS=", `'${popUp.address}'`);
    
  let addresses = [
    `POPUP_ADDRESS=${popUp.address}`,
    `SKY_ADDRESS=${sky.address}`,
  ];
  const data = "\n" + addresses.join("\n");

  const writeFile = promisify(fs.appendFile);
  const filePath = ".env";
  return writeFile(filePath, data)
    .then(() => {
      console.log("Addresses recorded.");
    })
    .catch((error) => {
      console.error("Error logging addresses:", error);
      throw error;
    });
}

/*
  npx hardhat run --network localhost scripts/02_deployTokens.js
*/

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
