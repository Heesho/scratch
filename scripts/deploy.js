const { ethers } = require("hardhat");
const { utils, BigNumber } = require("ethers");
const hre = require("hardhat");

// Constants
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const pointOne = convert("0.1", 18);

// Contract Variables
let base, plugin, multicall, voter;

/*===================================================================*/
/*===========================  CONTRACT DATA  =======================*/

async function getContracts() {
  base = await ethers.getContractAt(
    "contracts/Base.sol:Base",
    "0x7507c1dc16935B82698e4C63f2746A2fCf994dF8" // WBERA
  );
  voter = await ethers.getContractAt(
    "contracts/Voter.sol:Voter",
    "0x60305899769bE42c51B535733DFb5D7B46207D25"
  );
  plugin = await ethers.getContractAt(
    "contracts/PastaPlugin.sol:PastaPlugin",
    "0x4B81C239d8f6D0d269f7010dADb31BF31eA39461"
  );
  multicall = await ethers.getContractAt(
    "contracts/Multicall.sol:Multicall",
    "0x5E42bb6Cf9418bdeFdfC3Eb36B99266B66798f7d"
  );
  console.log("Contracts Retrieved");
}

/*===========================  END CONTRACT DATA  ===================*/
/*===================================================================*/

async function deployBase() {
  console.log("Starting Base Deployment");
  const baseArtifact = await ethers.getContractFactory("Base");
  const baseContract = await baseArtifact.deploy();
  base = await baseContract.deployed();
  console.log("Base Deployed at:", base.address);
}

async function deployVoter() {
  console.log("Starting Voter Deployment");
  const voterArtifact = await ethers.getContractFactory("Voter");
  const voterContract = await voterArtifact.deploy();
  voter = await voterContract.deployed();
  console.log("Voter Deployed at:", voter.address);
}

async function deployPlugin(wallet) {
  console.log("Starting Plugin Deployment");
  const pluginArtifact = await ethers.getContractFactory("PastaPlugin");
  const pluginContract = await pluginArtifact.deploy(
    base.address,
    voter.address,
    [base.address],
    [base.address],
    wallet.address,
    {
      gasPrice: ethers.gasPrice,
    }
  );
  plugin = await pluginContract.deployed();
  await sleep(5000);
  console.log("Plugin Deployed at:", plugin.address);
}

async function deployMulticall() {
  console.log("Starting Multicall Deployment");
  const multicallArtifact = await ethers.getContractFactory("Multicall");
  const multicallContract = await multicallArtifact.deploy(
    plugin.address,
    voter.address,
    await voter.OTOKEN(),
    {
      gasPrice: ethers.gasPrice,
    }
  );
  multicall = await multicallContract.deployed();
  console.log("Multicall Deployed at:", multicall.address);
}

async function printDeployment() {
  console.log("**************************************************************");
  console.log("Base: ", base.address);
  console.log("Voter: ", voter.address);
  console.log("Plugin: ", plugin.address);
  console.log("Multicall: ", multicall.address);
  console.log("**************************************************************");
}

async function verifyBase() {
  await hre.run("verify:verify", {
    address: base.address,
    constructorArguments: [],
  });
}

async function verifyVoter() {
  await hre.run("verify:verify", {
    address: voter.address,
    constructorArguments: [],
  });
}

async function verifyPlugin(wallet) {
  await hre.run("verify:verify", {
    address: plugin.address,
    constructorArguments: [
      base.address,
      voter.address,
      [base.address],
      [base.address],
      wallet.address,
    ],
  });
}

async function verifyMulticall() {
  await hre.run("verify:verify", {
    address: multicall.address,
    constructorArguments: [plugin.address, voter.address, await voter.OTOKEN()],
  });
}

async function setUpSystem() {
  console.log("Starting System Set Up");
  await voter.setPlugin(plugin.address);
  console.log("plugin whitelisted to mint units.");
  console.log("System Initialized");
}

async function main() {
  const [wallet] = await ethers.getSigners();
  console.log("Using wallet: ", wallet.address);

  await getContracts();

  // await deployBase();
  // await deployVoter();
  // await deployPlugin(wallet);
  // await deployMulticall();
  // await printDeployment();

  // await verifyBase();
  // await verifyVoter();
  // await verifyPlugin(wallet);
  // await verifyMulticall();

  // await setUpSystem();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
