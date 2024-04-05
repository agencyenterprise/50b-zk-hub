import fs from 'fs';

export const base64ToFile = (base64String: string, filePath: string) => {
  return new Promise((resolve, reject) => {
    const fileBuffer = Buffer.from(base64String, 'base64');
    fs.writeFile(filePath, fileBuffer, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(filePath);
      }
    });
  });
}