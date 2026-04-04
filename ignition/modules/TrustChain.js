const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TrustChainModule", (m) => {
  const trustchain = m.contract("TrustChain", []);

  return { trustchain };
});
