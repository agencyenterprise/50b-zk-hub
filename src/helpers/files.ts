import fs from 'fs';

export const deleteFile = (filename: string) => {
  fs.unlink(filename, (err) => {
    if (err) {
      console.error('Error deleting file:', err);
      return;
    }
  });
}