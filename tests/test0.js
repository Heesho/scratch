const convert = (amount, decimals) => ethers.utils.parseUnits(amount, decimals);
const divDec = (amount, decimals = 18) => amount / 10 ** decimals;
const divDec6 = (amount, decimals = 6) => amount / 10 ** decimals;
const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { execPath } = require("process");

const AddressZero = "0x0000000000000000000000000000000000000000";
const pointOne = convert("0.1", 18);
const one = convert("1", 18);
const ten = convert("10", 18);
const oneHundred = convert("100", 18);
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
        [0, one, oneHundred],
        1729510478
      );

    ticket0Address = await factory.index_Ticket(1);
    ticket0 = await ethers.getContractAt("ScratchTicket", ticket0Address);
    console.log(ticket0.address);
  });

  it("User1 buys ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user1).approve(ticket0.address, one);
    await ticket0.connect(user1).buy(user1.address, 1);
  });

  it("User2 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user2).approve(ticket0.address, ten);
    await ticket0.connect(user2).buy(user2.address, 10);
  });

  it("User1 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).scratch(1);
  });

  it("User1 views ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getTicket(1));
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 scratches ticket", async function () {
    console.log("******************************************************");
    await expect(ticket0.connect(user1).scratch(1)).to.be.revertedWith(
      "ScratchTicket__AlreadyScratched"
    );
  });

  it("User1 tries scratching user2 ticket", async function () {
    console.log("******************************************************");
    await expect(ticket0.connect(user1).scratch(2)).to.be.revertedWith(
      "ScratchTicket__NotTicketOwner"
    );
  });

  it("User2 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).scratch(2);
    await ticket0.connect(user2).scratch(3);
    await ticket0.connect(user2).scratch(4);
    await ticket0.connect(user2).scratch(5);
  });

  it("User1 views ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getTicket(2));
    console.log(await ticket0.getTicket(3));
    console.log(await ticket0.getTicket(4));
    console.log(await ticket0.getTicket(5));
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 claims ticket", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getTicket(1));
    await ticket0.connect(user1).claim(1);
  });

  it("User1 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user1).approve(ticket0.address, ten);
    await ticket0.connect(user1).buy(user1.address, 10);
  });

  it("User2 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).scratch(6);
    await ticket0.connect(user2).scratch(7);
    await ticket0.connect(user2).scratch(8);
    await ticket0.connect(user2).scratch(9);
    await ticket0.connect(user2).scratch(10);
    await ticket0.connect(user2).scratch(11);
    await expect(ticket0.connect(user2).scratch(12)).to.be.revertedWith(
      "ScratchTicket__NotTicketOwner"
    );
    await expect(ticket0.connect(user2).scratch(11)).to.be.revertedWith(
      "ScratchTicket__AlreadyScratched"
    );
  });

  it("User1 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).scratch(12);
    await ticket0.connect(user1).scratch(13);
    await ticket0.connect(user1).scratch(14);
    await ticket0.connect(user1).scratch(15);
    await ticket0.connect(user1).scratch(16);

    await ticket0.connect(user1).scratch(17);
    await ticket0.connect(user1).scratch(18);
    await ticket0.connect(user1).scratch(19);
    await ticket0.connect(user1).scratch(20);
    await ticket0.connect(user1).scratch(21);
  });

  it("User2 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).claim(2);
    await ticket0.connect(user2).claim(3);
    await ticket0.connect(user2).claim(4);
    await ticket0.connect(user2).claim(5);
    await ticket0.connect(user2).claim(6);
    await ticket0.connect(user2).claim(7);
    await ticket0.connect(user2).claim(8);
    await ticket0.connect(user2).claim(9);
    await ticket0.connect(user2).claim(10);
    await ticket0.connect(user2).claim(11);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).claim(12);
    await ticket0.connect(user1).claim(13);
    await ticket0.connect(user1).claim(14);
    await ticket0.connect(user1).claim(15);
    await ticket0.connect(user1).claim(16);
    await ticket0.connect(user1).claim(17);
    await ticket0.connect(user1).claim(18);
    await ticket0.connect(user1).claim(19);
    await ticket0.connect(user1).claim(20);
    await ticket0.connect(user1).claim(21);
  });

  it("User3 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user3).approve(ticket0.address, ten);
    await ticket0.connect(user3).buy(user3.address, 10);
  });

  it("User3 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).scratch(22);
    await ticket0.connect(user3).scratch(23);
    await ticket0.connect(user3).scratch(24);
    await ticket0.connect(user3).scratch(25);
    await ticket0.connect(user3).scratch(26);
    await ticket0.connect(user3).scratch(27);
    await ticket0.connect(user3).scratch(28);
    await ticket0.connect(user3).scratch(29);
    await ticket0.connect(user3).scratch(30);
    await ticket0.connect(user3).scratch(31);
  });

  it("User3 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).claim(22);
    await ticket0.connect(user3).claim(23);
    await ticket0.connect(user3).claim(24);
    await ticket0.connect(user3).claim(25);
    await ticket0.connect(user3).claim(26);
    await ticket0.connect(user3).claim(27);
    await ticket0.connect(user3).claim(28);
    await ticket0.connect(user3).claim(29);
    await ticket0.connect(user3).claim(30);
    await ticket0.connect(user3).claim(31);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user1).approve(ticket0.address, ten);
    await ticket0.connect(user1).buy(user1.address, 10);
  });

  it("User1 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).scratch(32);
    await ticket0.connect(user1).scratch(33);
    await ticket0.connect(user1).scratch(34);
    await ticket0.connect(user1).scratch(35);
    await ticket0.connect(user1).scratch(36);
    await ticket0.connect(user1).scratch(37);
    await ticket0.connect(user1).scratch(38);
    await ticket0.connect(user1).scratch(39);
    await ticket0.connect(user1).scratch(40);
    await ticket0.connect(user1).scratch(41);
  });

  it("User1 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).claim(32);
    await ticket0.connect(user1).claim(33);
    await ticket0.connect(user1).claim(34);
    await ticket0.connect(user1).claim(35);
    await ticket0.connect(user1).claim(36);
    await ticket0.connect(user1).claim(37);
    await ticket0.connect(user1).claim(38);
    await ticket0.connect(user1).claim(39);
    await ticket0.connect(user1).claim(40);
    await ticket0.connect(user1).claim(41);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User2 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user2).approve(ticket0.address, ten);
    await ticket0.connect(user2).buy(user2.address, 10);
  });

  it("User2 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).scratch(42);
    await ticket0.connect(user2).scratch(43);
    await ticket0.connect(user2).scratch(44);
    await ticket0.connect(user2).scratch(45);
    await ticket0.connect(user2).scratch(46);
    await ticket0.connect(user2).scratch(47);
    await ticket0.connect(user2).scratch(48);
    await ticket0.connect(user2).scratch(49);
    await ticket0.connect(user2).scratch(50);
    await ticket0.connect(user2).scratch(51);
  });

  it("User2 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).claim(42);
    await ticket0.connect(user2).claim(43);
    await ticket0.connect(user2).claim(44);
    await ticket0.connect(user2).claim(45);
    await ticket0.connect(user2).claim(46);
    await ticket0.connect(user2).claim(47);
    await ticket0.connect(user2).claim(48);
    await ticket0.connect(user2).claim(49);
    await ticket0.connect(user2).claim(50);
    await ticket0.connect(user2).claim(51);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User3 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user3).approve(ticket0.address, ten);
    await ticket0.connect(user3).buy(user3.address, 10);
  });

  it("User3 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).scratch(52);
    await ticket0.connect(user3).scratch(53);
    await ticket0.connect(user3).scratch(54);
    await ticket0.connect(user3).scratch(55);
    await ticket0.connect(user3).scratch(56);
    await ticket0.connect(user3).scratch(57);
    await ticket0.connect(user3).scratch(58);
    await ticket0.connect(user3).scratch(59);
    await ticket0.connect(user3).scratch(60);
    await ticket0.connect(user3).scratch(61);
  });

  it("User3 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).claim(52);
    await ticket0.connect(user3).claim(53);
    await ticket0.connect(user3).claim(54);
    await ticket0.connect(user3).claim(55);
    await ticket0.connect(user3).claim(56);
    await ticket0.connect(user3).claim(57);
    await ticket0.connect(user3).claim(58);
    await ticket0.connect(user3).claim(59);
    await ticket0.connect(user3).claim(60);
    await ticket0.connect(user3).claim(61);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user1).approve(ticket0.address, ten);
    await ticket0.connect(user1).buy(user1.address, 10);
  });

  it("User1 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).scratch(62);
    await ticket0.connect(user1).scratch(63);
    await ticket0.connect(user1).scratch(64);
    await ticket0.connect(user1).scratch(65);
    await ticket0.connect(user1).scratch(66);
    await ticket0.connect(user1).scratch(67);
    await ticket0.connect(user1).scratch(68);
    await ticket0.connect(user1).scratch(69);
    await ticket0.connect(user1).scratch(70);
    await ticket0.connect(user1).scratch(71);
  });

  it("User1 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user1).claim(62);
    await ticket0.connect(user1).claim(63);
    await ticket0.connect(user1).claim(64);
    await ticket0.connect(user1).claim(65);
    await ticket0.connect(user1).claim(66);
    await ticket0.connect(user1).claim(67);
    await ticket0.connect(user1).claim(68);
    await ticket0.connect(user1).claim(69);
    await ticket0.connect(user1).claim(70);
    await ticket0.connect(user1).claim(71);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User2 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user2).approve(ticket0.address, ten);
    await ticket0.connect(user2).buy(user2.address, 10);
  });

  it("User2 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).scratch(72);
    await ticket0.connect(user2).scratch(73);
    await ticket0.connect(user2).scratch(74);
    await ticket0.connect(user2).scratch(75);
    await ticket0.connect(user2).scratch(76);
    await ticket0.connect(user2).scratch(77);
    await ticket0.connect(user2).scratch(78);
    await ticket0.connect(user2).scratch(79);
    await ticket0.connect(user2).scratch(80);
    await ticket0.connect(user2).scratch(81);
  });

  it("User2 claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user2).claim(72);
    await ticket0.connect(user2).claim(73);
    await ticket0.connect(user2).claim(74);
    await ticket0.connect(user2).claim(75);
    await ticket0.connect(user2).claim(76);
    await ticket0.connect(user2).claim(77);
    await ticket0.connect(user2).claim(78);
    await ticket0.connect(user2).claim(79);
    await ticket0.connect(user2).claim(80);
    await ticket0.connect(user2).claim(81);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User3 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user3).approve(ticket0.address, ten);
    await ticket0.connect(user3).buy(user3.address, 10);
  });

  it("User3 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).scratch(82);
    await ticket0.connect(user3).scratch(83);
    await ticket0.connect(user3).scratch(84);
    await ticket0.connect(user3).scratch(85);
    await ticket0.connect(user3).scratch(86);
    await ticket0.connect(user3).scratch(87);
    await ticket0.connect(user3).scratch(88);
    await ticket0.connect(user3).scratch(89);
    await ticket0.connect(user3).scratch(90);
    await ticket0.connect(user3).scratch(91);
  });

  it("User3  claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).claim(82);
    await ticket0.connect(user3).claim(83);
    await ticket0.connect(user3).claim(84);
    await ticket0.connect(user3).claim(85);
    await ticket0.connect(user3).claim(86);
    await ticket0.connect(user3).claim(87);
    await ticket0.connect(user3).claim(88);
    await ticket0.connect(user3).claim(89);
    await ticket0.connect(user3).claim(90);
    await ticket0.connect(user3).claim(91);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User3 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user3).approve(ticket0.address, ten);
    await ticket0.connect(user3).buy(user3.address, 10);
  });

  it("User3 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).scratch(92);
    await ticket0.connect(user3).scratch(93);
    await ticket0.connect(user3).scratch(94);
    await ticket0.connect(user3).scratch(95);
    await ticket0.connect(user3).scratch(96);
    await ticket0.connect(user3).scratch(97);
    await ticket0.connect(user3).scratch(98);
    await ticket0.connect(user3).scratch(99);
    await ticket0.connect(user3).scratch(100);
    await ticket0.connect(user3).scratch(101);
  });

  it("User3  claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).claim(92);
    await ticket0.connect(user3).claim(93);
    await ticket0.connect(user3).claim(94);
    await ticket0.connect(user3).claim(95);
    await ticket0.connect(user3).claim(96);
    await ticket0.connect(user3).claim(97);
    await ticket0.connect(user3).claim(98);
    await ticket0.connect(user3).claim(99);
    await ticket0.connect(user3).claim(100);
    await ticket0.connect(user3).claim(101);
  });

  it("User3 buys 10 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user3).approve(ticket0.address, ten);
    await ticket0.connect(user3).buy(user3.address, 10);
  });

  it("User3 scratches ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).scratch(102);
    await ticket0.connect(user3).scratch(103);
    await ticket0.connect(user3).scratch(104);
    await ticket0.connect(user3).scratch(105);
    await ticket0.connect(user3).scratch(106);
    await ticket0.connect(user3).scratch(107);
    await ticket0.connect(user3).scratch(108);
    await ticket0.connect(user3).scratch(109);
    await ticket0.connect(user3).scratch(110);
    await ticket0.connect(user3).scratch(111);
  });

  it("User3  claims ticket", async function () {
    console.log("******************************************************");
    await ticket0.connect(user3).claim(102);
    await ticket0.connect(user3).claim(103);
    await ticket0.connect(user3).claim(104);
    await ticket0.connect(user3).claim(105);
    await ticket0.connect(user3).claim(106);
    await ticket0.connect(user3).claim(107);
    await ticket0.connect(user3).claim(108);
    await ticket0.connect(user3).claim(109);
    await ticket0.connect(user3).claim(110);
    await ticket0.connect(user3).claim(111);
  });

  it("View ticket results", async function () {
    console.log("******************************************************");
    console.log(await ticket0.getAmounts());
    console.log(await ticket0.getPayouts());
  });

  it("User1 buys 1 ticket0", async function () {
    console.log("******************************************************");
    await base.connect(user1).approve(ticket0.address, one);
    await expect(
      ticket0.connect(user1).buy(user1.address, 1)
    ).to.be.revertedWith("ScratchTicket__MaxSupplyReached");
  });

  it("User0 withdraws funds", async function () {
    console.log("******************************************************");
    await expect(
      ticket0.connect(user0).withdraw(user0.address, base.address)
    ).to.be.revertedWith("ScratchTicket__StillActive");
  });

  it("Forward 1 month", async function () {
    console.log("******************************************************");
    await network.provider.send("evm_increaseTime", [3600 * 24 * 60]);
    await network.provider.send("evm_mine");
  });

  it("User0 withdraws funds", async function () {
    console.log("******************************************************");
    console.log("Total Deposit: ", await ticket0.totalDeposit());
    console.log("User0 Balance: ", divDec(await base.balanceOf(user0.address)));
    await ticket0.connect(user0).withdraw(user0.address, base.address);
    console.log("User0 Balance: ", divDec(await base.balanceOf(user0.address)));
  });
});
