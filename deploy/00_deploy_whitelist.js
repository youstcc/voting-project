module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();
  
    await deploy("Whitelist", {
      from: deployer,
      log: true,
    });
  };