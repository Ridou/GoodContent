const { exec } = require('child_process');
const path = require('path');

async function separateAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const command = `python ${path.resolve(__dirname, 'spleeter_separation.py')} ${inputPath} ${outputPath}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error separating audio: ${stderr}`);
        return reject(new Error(`Error separating audio: ${stderr}`));
      }
      console.log(`Audio separated: ${stdout}`);
      resolve(stdout);
    });
  });
}

module.exports = { separateAudio };
