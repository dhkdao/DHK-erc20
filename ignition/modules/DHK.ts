import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DHKModule = buildModule("DHKModule", (m) => {
  const initOwner = m.getParameter("initOwner");
  const dhkImpl = m.contract("DHK", [], { id: "DHKImpl" });

  const initData = m.encodeFunctionCall(dhkImpl, "initialize", [initOwner]);
  const dhkProxy = m.contract("ERC1967Proxy", [dhkImpl, initData]);

  const dhk = m.contractAt("DHK", dhkProxy);

  return { dhk, dhkImpl, dhkProxy };
});

export default DHKModule;
