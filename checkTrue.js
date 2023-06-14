const fs = require('fs');
const path = require('path');

const folderPath = '/Users/sangjun.lee/Sangjun/fathom-stablecoin-smart-contracts/testResults2'; // Replace with the actual path to your folder

let trueCountFXD = 0;
let falseCountFXD = 0;
let trueCountUSDT = 0;
let falseCountUSDT = 0;

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error('Error reading folder:', err);
    return;
  }

  // Filter .json files
  const jsonFiles = files.filter((file) => path.extname(file) === '.json');

  // Process each .json file
  jsonFiles.forEach((file) => {
    const filePath = path.join(folderPath, file);

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }

      try {
        const jsonData = JSON.parse(data);

        // Check the desired values
        const isFXDValueCorrect = jsonData.IsFXDValueAsExpectedPostWithdrawl === true;
        const isUSDTValueCorrect = jsonData.IsUSDTValueAsExpectedPostWithdrawl === true;

        // Increment the count based on the values
        if (isFXDValueCorrect) {
          trueCountFXD++;
        } else {
          falseCountFXD++;
        }

        if (isUSDTValueCorrect) {
          trueCountUSDT++;
        } else {
          falseCountUSDT++;
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });
  });
});

// Log the counts after all files have been processed
process.on('exit', () => {
  console.log('FXD Value Results:');
  console.log('--------------------------');
  console.log(`True count: ${trueCountFXD}`);
  console.log(`False count: ${falseCountFXD}`);
  console.log('');

  console.log('USDT Value Results:');
  console.log('--------------------------');
  console.log(`True count: ${trueCountUSDT}`);
  console.log(`False count: ${falseCountUSDT}`);
});

// Handle any errors during the process
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
