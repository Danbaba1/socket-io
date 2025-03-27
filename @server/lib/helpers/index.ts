import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use __dirname for path resolution
const packageJsonPath = path.join(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

export const getPackageVersion = () => packageJson.version;

export const success = (message: string) => {
  console.log(chalk.greenBright(message));
}

export const warning = (message: string) => {
  console.log(chalk.yellowBright(message));
}

export const error = (message: string) => {
  console.log(chalk.redBright(message));
}

export const server = (serverPort: number | string): void => {
  try {
    success(`\nv${packageJson.version} ${packageJson.description}`);
    success(`\nServer running at ${serverPort}`);
  } catch (err) {
    error(`${JSON.stringify(err)}`);
  }
}
