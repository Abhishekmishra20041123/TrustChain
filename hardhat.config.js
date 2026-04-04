/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.24",
  paths: {
    // Crucial for Vite integration: export compiled ABIs directly into the React src folder
    artifacts: "./src/artifacts"
  },
  networks: {
    hardhat: {
      chainId: 31337 // Default local chain
    }
  }
};
