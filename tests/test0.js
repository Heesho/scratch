const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const divDec6 = (amount, decimals = 6) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointOne = convert("0.1", 18);
const one = convert("1", 18);
const oneThousand = convert("1000", 18);
const tenThousand = convert("10000", 18);

let owner, treasury, user0, user1, user2, user3;
let base, factory, ticket0;

describe("local: test0", function () {
  before("Initial set up", async function () {
    console.log("Begin Initialization");

    [owner, treasury, user0, user1, user2, user3] = await ethers.getSigners();

    const baseArtifact = await ethers.getContractFactory("ERC20Mock");
    base = await baseArtifact.deploy("Base", "BASE");
    console.log("- Base Initialized");

    const factoryArtifact = await ethers.getContractFactory(
      "ScratchTicketFactory"
    );
    factory = await factoryArtifact.deploy();
    console.log("- Factory Initialized");

    await base.mint(owner.address, tenThousand);
    await base.mint(user0.address, tenThousand);
    await base.mint(user1.address, tenThousand);
    await base.mint(user2.address, tenThousand);
    await base.mint(user3.address, tenThousand);

    console.log("Initialization Complete");
    console.log();
  });

  it("User0 creates ticket0", async function () {
    console.log("******************************************************");
    base.connect(user0).approve(factory.address, oneThousand);

    await factory
      .connect(user0)
      .createScratchTicket(
        "Ticket0",
        "TICKET0",
        base.address,
        base.address,
        one,
        [100, 10, 1],
        [0, 1, 100],
        1729510478
      );

    ticket0Address = await factory.index_Ticket(0);
    ticket0 = await ethers.getContractAt("ScratchTicket", ticket0Address);
  });
});
