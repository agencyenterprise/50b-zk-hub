const fs = require('fs');

// Function to convert a base64 string to its original file form
function base64ToFile(base64String, filePath) {
  return new Promise((resolve, reject) => {
    const fileBuffer = Buffer.from(base64String, 'base64');
    fs.writeFile(filePath, fileBuffer, err => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}

// Usage example
const base64String = 'cHJhZ21hIGNpcmNvbSAyLjAuMDsKCnRlbXBsYXRlIE11bHRpcGxpZXIobikgewogICAgc2lnbmFsIGlucHV0IGE7CiAgICBzaWduYWwgaW5wdXQgYjsKICAgIHNpZ25hbCBvdXRwdXQgYzsKCiAgICBzaWduYWwgaW50W25dOwoKICAgIGludFswXSA8PT0gYSphICsgYjsKICAgIGZvciAodmFyIGk9MTsgaTxuOyBpKyspIHsKICAgIGludFtpXSA8PT0gaW50W2ktMV0qaW50W2ktMV0gKyBiOwogICAgfQoKICAgIGMgPD09IGludFtuLTFdOwp9Cgpjb21wb25lbnQgbWFpbiA9IE11bHRpcGxpZXIoMTAwMCk7Cg=='; // Replace with your base64 string
const filePath = 'converted-file.circom'; // Specify the file path to save the converted file

base64ToFile(base64String, filePath)
  .then(savedFilePath => {
    console.log('File converted and saved at:', savedFilePath);
  })
  .catch(error => {
    console.error('Error:', error);
  });
