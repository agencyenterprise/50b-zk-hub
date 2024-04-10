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

function createTxtFile(filename, content) {
  fs.writeFile(filename, content, (err) => {
    if (err) {
      console.error('Error creating file:', err);
      return;
    }
    console.log(`File '${filename}' created successfully.`);
  });
}


// Usage example
const filePath = 'factor.r1cs'; // Replace with the path to your file
fileToBase64(filePath)
  .then(base64String => {
    createTxtFile('r1cs.txt', base64String)
  })
  .catch(error => {
    console.error('Error:', error);
  });