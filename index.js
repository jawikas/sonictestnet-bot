const {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
} = require('@solana/web3.js');
const bip39 = require('bip39');
const { derivePath } = require('ed25519-hd-key');
const bs58 = require('bs58');
const prompt = require('prompt');
const fs = require('fs');
const fetch = require('node-fetch');
require('dotenv').config();

const DEVNET_URL = 'https://devnet.sonic.game/';
const connection = new Connection(DEVNET_URL, 'confirmed');
let keypairs = [];

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function printBanner() {
  const banner = `
    ██╗████████╗███████╗     ██╗ █████╗ ██╗    ██╗
    ██║╚══██╔══╝██╔════╝     ██║██╔══██╗██║    ██║
    ██║   ██║   ███████╗     ██║███████║██║ █╗ ██║
    ██║   ██║   ╚════██║██   ██║██╔══██║██║███╗██║
    ██║   ██║   ███████║╚█████╔╝██║  ██║╚███╔███╔╝
    ╚═╝   ╚═╝   ╚══════╝ ╚════╝ ╚═╝  ╚══╝╚══╝  `;
  console.log(colors.green + banner + colors.reset);
  console.log(colors.green + "    Sonic Testnet Automated bot" + colors.reset);
  console.log(colors.red + "    NOT FOR SALE = Free to use \n" + colors.reset);
}

const authorizationTokens = JSON.parse(process.env.AUTH_TOKENS || '[]');

async function refreshData(token) {
  try {
    const refreshResponse = await fetch('https://odyssey-api.sonic.game/user/transactions/state/daily', {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': 'https://odyssey.sonic.game',
        'Referer': 'https://odyssey.sonic.game/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      }
    });

    return true;
  } catch (error) {
    console.error('Error refreshing data:', error);
    return false;
  }
}

async function claimRewards() {
  try {
    for (const { name, token } of authorizationTokens) {
      await refreshData(token);

      const headers = {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Accept-Language': 'en-US,en;q=0.9',
        'Authorization': token,
        'Content-Type': 'application/json',
        'Origin': 'https://odyssey.sonic.game',
        'Referer': 'https://odyssey.sonic.game/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
      };

      for (let stage = 1; stage <= 3; stage++) {
        const response = await fetch('https://odyssey-api.sonic.game/user/transactions/rewards/claim', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ stage })
        });

        const responseData = await response.json();
        
        if (responseData.status === 'success') {
          console.log(`${colors.yellow}${name.padEnd(10)} ${colors.cyan}[  ${stage} ] ${colors.green}Success | ${colors.blue}Claim Reward | ${colors.green}the ring box has been picked up${colors.reset}`);
        } else {
          console.log(`${colors.yellow}${name.padEnd(10)} ${colors.cyan}[  ${stage} ] ${colors.red}Failed  | ${colors.blue}None Reward | ${colors.yellow}${responseData.message}${colors.reset}`);
        }
      }
    }

  } catch (error) {
    console.error('Error claiming rewards:', error);
  }
}

const transactionCount = {};
let totalSuccess = 0; 
let totalFailed = 0; 

async function sendSol(fromKeypair, toPublicKey, amount, transactionIndex, accountName) {
  const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: lamports,
    })
  );

  try {
    await sendAndConfirmTransaction(connection, transaction, [fromKeypair]);
    console.log(`${colors.yellow}${accountName.padEnd(10)}${colors.cyan} [ ${transactionIndex.toString().padStart(2)} ] ${colors.green}Success | ${colors.red}-${amount.toFixed(5)} ${colors.green}SOL | ${colors.yellow}${toPublicKey.toString()}${colors.reset}`);
    totalSuccess++;
  } catch (error) {
    console.error(`${colors.red}Failed | send SOL | [${toPublicKey.toString()}] | from account${colors.reset} ${accountName}:`, error.message);
    totalFailed++; 
  }
}


function generateRandomAddresses(count) {
  const addresses = [];
  for (let i = 0; i < count; i++) {
    const keypair = Keypair.generate();
    addresses.push(keypair.publicKey.toString());
  }
  return addresses;
}

async function getKeypairFromSeed(seedPhrase) {
  const seed = await bip39.mnemonicToSeed(seedPhrase);
  const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
  return Keypair.fromSeed(derivedSeed.slice(0, 32));
}

function getKeypairFromPrivateKey(privateKey) {
  const decoded = bs58.decode(privateKey);
  return Keypair.fromSecretKey(decoded);
}

function parseEnvArray(envVar, defaultValue = '[]') {
  try {
    return JSON.parse(envVar || defaultValue);
  } catch (e) {
    console.error('Failed to parse environment variable:', envVar, e);
    return [];
  }
}

async function getSolanaBalance(fromKeypair) {
  return connection.getBalance(fromKeypair.publicKey);
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function listAccounts() {
  console.log(`\n${colors.yellow}Available accounts:${colors.reset}\n`);
  for (let i = 0; i < keypairs.length; i++) {
    console.log(`[${i + 1}] ${keypairs[i].name}`);
  }
}

async function main() {
  console.clear();
  printBanner();
  prompt.start();

  const seedPhrases = parseEnvArray(process.env.SEED_PHRASES);
  const privateKeys = parseEnvArray(process.env.PRIVATE_KEYS);

  const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

  for (const entry of seedPhrases) {
    const keypair = await getKeypairFromSeed(entry.phrase);
    keypairs.push({ name: entry.name, keypair });
    transactionCount[entry.name] = 0; 
  }

  for (const privateKey of privateKeys) {
    const keypair = getKeypairFromPrivateKey(privateKey);
    keypairs.push({ name: 'PrivateKey', keypair });
    transactionCount['PrivateKey'] = 0; 
  }

  if (keypairs.length === 0) {
    throw new Error('No valid SEED_PHRASES or PRIVATE_KEYS found in the .env file');
  }

  let executeAll = '';

  const { executeAllOption } = await prompt.get({
    name: 'executeAllOption',
    description: 'Execute transactions for all accounts? (Y/N)',
    type: 'string',
    required: true,
    pattern: /^[YN]$/i,
    message: 'Please enter Y or N',
  });

  executeAll = executeAllOption.toUpperCase();

  if (executeAll === 'N') {
    await listAccounts();

    const { selectedAccountIndices } = await prompt.get({
      name: 'selectedAccountIndices',
      description: `Enter the account indices (comma-separated, e.g., 1,4,6)`,
      type: 'string',
      required: true,
      pattern: /^(\d+,)*\d+$/,
      message: `Invalid input. Please enter a comma-separated list of indices (e.g., 1,4,6)`
    });

    const { numTransactions } = await prompt.get({
      name: 'numTransactions',
      description: `Enter the number of transactions to execute for each account`,
      type: 'number',
      required: true,
      message: `Please enter a valid number`
    });

    const indices = selectedAccountIndices.split(',').map(i => parseInt(i.trim()) - 1);
    const selectedAccounts = indices.map(index => keypairs[index]);

    for (const selectedAccount of selectedAccounts) {
      await executeTransactions(selectedAccount, numTransactions, config);
    }
  } else {
    const { numTransactions } = await prompt.get({
      name: 'numTransactions',
      description: `Enter the number of transactions to execute for each account`,
      type: 'number',
      required: true,
      message: `Please enter a valid number`
    });

    const transactionPromises = keypairs.map(async (selectedAccount) => {
      await executeTransactions(selectedAccount, numTransactions, config);
    });

    await Promise.all(transactionPromises);
    await claimRewards();
  }
  console.log(`${colors.red}==============================================================${colors.reset}`);
  console.log(`${colors.green}Total Successful Transactions: ${totalSuccess}${colors.reset}`);
  console.log(`${colors.red}Total Failed Transactions: ${totalFailed}${colors.reset}`);
  
}

async function executeTransactions(selectedAccount, numTransactions, config) {
  const { name, keypair } = selectedAccount;

  const { minAmount, maxAmount, minDelay, maxDelay, delayEachAccount } = config;

  try {
    const solBalance = (await getSolanaBalance(keypair)) / LAMPORTS_PER_SOL;
    if (solBalance <= 0) {
      console.log(`${colors.green}${name.padEnd(10)} ${colors.red}| ${solBalance} | ${colors.yellow}Insufficient balance SOL${colors.reset}`);
      return;
    }
    if (solBalance < minAmount * numTransactions) {
      console.log(`${colors.red}[${name}:] ${solBalance} Insufficient balance SOL${colors.reset}`);
      return;
    }
  } catch (error) {
    console.error(`${colors.red}Failed to retrieve balance for ${name}:${colors.reset}`, error.message);
    totalFailed += numTransactions;
    return;
  }
  const solBalance = (await getSolanaBalance(keypair)) / LAMPORTS_PER_SOL;
  const randomAddresses = generateRandomAddresses(numTransactions);
  console.log(`${colors.yellow}${name.padEnd(10)} ${colors.cyan}[  ${numTransactions} ] ${colors.green}Success | ${colors.red}${solBalance} ${colors.green}SOL | ${colors.yellow}Generated random addresses${colors.reset}`);

  for (let j = 0; j < randomAddresses.length; j++) {
    const amountToSend = Math.random() * (maxAmount - minAmount) + minAmount;
    const toPublicKey = new PublicKey(randomAddresses[j]);

    const transactionIndex = transactionCount[name] + 1; 
    transactionCount[name]++; 

    await sendSol(keypair, toPublicKey, amountToSend, transactionIndex, name);

    const delayBetweenRequests = Math.floor(Math.random() * (maxDelay - minDelay) + minDelay);
    await delay(delayBetweenRequests);
  }

  await delay(delayEachAccount);
}
main().catch((err) => {
  console.error(`${colors.red}${err}${colors.reset}`);
  console.log(`${colors.green}Total Successful Transactions: ${totalSuccess}${colors.reset}`);
  console.log(`${colors.red}Total Failed Transactions: ${totalFailed}${colors.reset}`);
});
