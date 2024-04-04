const fs = require('fs');

// Function to read a file and convert its contents to base64
function fileToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const base64String = data.toString('base64');
        resolve(base64String);
      }
    });
  });
}

// Usage example
const filePath = 'circuit.circom'; // Replace with the path to your file
fileToBase64(filePath)
  .then(base64String => {
    console.log('Base64 string:', base64String);
  })
  .catch(error => {
    console.error('Error:', error);
  });