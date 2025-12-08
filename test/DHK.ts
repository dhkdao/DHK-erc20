import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import { ignition, viem } from "hardhat";
import { parseEther } from "viem";

import DHKModule from "../ignition/modules/DHK";

describe("DHK", async function () {
  async function deployToken() {
    const [deployer, rick, kin, bob] = await viem.getWalletClients();
    const publicClient = await viem.getPublicClient();
    const { dhk, dhkImpl, dhkProxy } = await ignition.deploy(DHKModule, {
      parameters: {
        DHKModule: {
          initOwner: deployer.account.address,
        },
      },
      defaultSender: deployer.account.address,
      strategy: "create2",
    });

    return {
      dhk,
      dhkImpl,
      dhkProxy,
      deployer,
      rick,
      kin,
      bob,
      publicClient,
    };
  }

  describe("Basic ERC20 functionality", async function () {
    it("should have 3 decimals", async function () {
      const { dhk } = await loadFixture(deployToken);
      expect(await dhk.read.decimals()).to.equal(3);
    });

    it("should belong to the deployer", async function () {
      const { dhk, deployer } = await loadFixture(deployToken);
      const owner = await dhk.read.owner();
      expect(owner.toLowerCase()).to.equal(
        deployer.account.address.toLowerCase(),
      );
    });

    it("Should have correct name and symbol", async function () {
      const { dhk } = await loadFixture(deployToken);
      expect(await dhk.read.name()).to.equal("DHK dao");
      expect(await dhk.read.symbol()).to.equal("DHK");
    });

    it("Should mint tokens correctly", async function () {
      const { dhk, bob } = await loadFixture(deployToken);
      const amount = parseEther("100");

      await dhk.write.mint([bob.account.address, amount]);
      expect(await dhk.read.balanceOf([bob.account.address])).to.equal(amount);
    });

    it("Should fail to mint tokens if not owner", async function () {
      const { dhk, rick } = await loadFixture(deployToken);
      const amount = parseEther("100");
      await expect(
        dhk.write.mint([rick.account.address, amount], {
          account: rick.account,
        }),
      ).to.be.rejectedWith("OwnableUnauthorizedAccount");
    });

    it("Should transfer tokens between accounts", async function () {
      const { dhk, rick, bob } = await loadFixture(deployToken);
      const amount = parseEther("100");
      const halfAmount = amount / 2n;

      await dhk.write.mint([rick.account.address, amount]);

      await dhk.write.transfer([bob.account.address, halfAmount], {
        account: rick.account,
      });

      expect(await dhk.read.balanceOf([rick.account.address])).to.equal(
        halfAmount,
      );
      expect(await dhk.read.balanceOf([bob.account.address])).to.equal(
        halfAmount,
      );
    });

    it("Should handle approvals and transferFrom", async function () {
      const { dhk, rick, bob } = await loadFixture(deployToken);
      const amount = parseEther("100");
      const halfAmount = amount / 2n;

      await dhk.write.mint([rick.account.address, amount]);

      await dhk.write.approve([bob.account.address, halfAmount], {
        account: rick.account,
      });

      expect(
        await dhk.read.allowance([rick.account.address, bob.account.address]),
      ).to.equal(halfAmount);

      await dhk.write.transferFrom(
        [rick.account.address, bob.account.address, halfAmount],
        { account: bob.account },
      );

      expect(await dhk.read.balanceOf([rick.account.address])).to.equal(
        halfAmount,
      );
      expect(await dhk.read.balanceOf([bob.account.address])).to.equal(
        halfAmount,
      );
      expect(
        await dhk.read.allowance([rick.account.address, bob.account.address]),
      ).to.equal(0n);
    });

    it("Should burn tokens correctly", async function () {
      const { dhk, rick } = await loadFixture(deployToken);
      const amount = parseEther("100");
      const quarterAmount = amount / 4n;
      const threeQuartersAmount = amount - quarterAmount;

      await dhk.write.mint([rick.account.address, amount]);

      await dhk.write.burn([quarterAmount], {
        account: rick.account,
      });

      expect(await dhk.read.balanceOf([rick.account.address])).to.equal(
        threeQuartersAmount,
      );
    });

    it("Should fail when transferring more than balance", async function () {
      const { dhk, rick, bob } = await loadFixture(deployToken);
      const amount = parseEther("100");
      const doubleAmount = amount * 2n;

      await dhk.write.mint([rick.account.address, amount]);

      await expect(
        dhk.write.transfer([bob.account.address, doubleAmount], {
          account: rick.account,
        }),
      ).to.be.rejectedWith("ERC20InsufficientBalance");
    });

    it("Should fail when transferring with insufficient allowance", async function () {
      const { dhk, rick, bob } = await loadFixture(deployToken);
      const amount = parseEther("100");
      const halfAmount = amount / 2n;
      const quarterAmount = amount / 4n;

      await dhk.write.mint([rick.account.address, amount]);
      await dhk.write.approve([bob.account.address, quarterAmount], {
        account: rick.account,
      });

      await expect(
        dhk.write.transferFrom(
          [rick.account.address, bob.account.address, halfAmount],
          { account: bob.account },
        ),
      ).to.be.rejectedWith("ERC20InsufficientAllowance");
    });
  });
});
