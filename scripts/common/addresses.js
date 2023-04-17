const fs = require('fs');

const Deployer = "0x0Eb7DEE6e18Cce8fE839E986502d95d47dC0ADa3"

const rawdata = fs.readFileSync('../../externalAddresses.json');
const addresses = JSON.parse(rawdata);

function getAddresses(chainId)  {
    return addresses[chainId]
}

module.exports = { getAddresses, Deployer }