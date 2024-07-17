![image](https://github.com/jawikas/sonictestnet-bot/assets/63976518/897cd08b-5b1d-4141-89ce-e6ae551c5c3f)

# Sonic Testnet Automated (Transactions) Bot

This repository contains a script for automating transactions on the Sonic testnet on Solana. The bot generates random addresses and sends SOL from configured accounts to these addresses. 

Website : https://odyssey.sonic.game/?join=WSdeGi

### Buy me Coffee ☕ 
```
0x705C71fc031B378586695c8f888231e9d24381b4
```
## New Update (Add auto Claim Box)
in this update there are some changes that you should pay attention to in `index.js` and `.env`, a few additions to the lines of code to claim mystery box prizes.

![image](https://github.com/jawikas/sonictestnet-bot/assets/63976518/5d21939a-b1fd-42f3-ac83-ad03b8a4b760)

## Features

- Multi accounts executions 
- Run the selected account only
- Generate random addresses
- Send SOL transactions to generated addresses
- Configurable delay and transaction amounts
- Track successful and failed transactions
- Auto Claim Mystery Box (RING) `new`

## Prerequisites

- Node.js (v12 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jawikas/sonictestnet-bot.git
   cd sonictestnet-bot
   ```
   
### Install the required npm modules:

   ```bash
npm install
   ```

Create a `.env` file in the root directory and add your seed phrases :
   ```env
SEED_PHRASES='[
  {"name": "nameAccount1", "phrase": "phraseAccount1"},
  {"name": "nameAccount2", "phrase": "phraseAccount2"}
]'
   ```

Create a `config.json` file in the root directory and add your configuration:
   ```json
{
  "minAmount": 0.00105,
  "maxAmount": 0.00135,
  "minDelay": 7000,
  "maxDelay": 13000,
  "delayEachAccount": 1500
}
   ```
- `minAmount` : minimum amount to send in sol
- `maxAmount` : maximum amount to send in sol
- `minDelay` : minimum delay for each transactions
- `maxDelay` : maximum delay for each transactions
- `delayEachAccount` : delay for each account to execute transactions

  Note : make sure not to lower the 'minAmount' to an amount lower than '0.001'

## Usage
Run the script:

   ```bash
node index.js
   ```

   ```bash
Follow the prompts to execute transactions:
   ```

Choose whether to execute transactions for all accounts or select specific accounts
Enter the number of transactions to execute for each account

## Functions
   ```bash
sendSol(fromKeypair, toPublicKey, amount, transactionIndex, accountName)
- Sends SOL from fromKeypair to toPublicKey
- Logs the transaction status

generateRandomAddresses(count)
- Generates random Solana public addresses
  
getKeypairFromSeed(seedPhrase)
- Derives a keypair from a seed phrase

getKeypairFromPrivateKey(privateKey)
- Gets a keypair from a private key

parseEnvArray(envVar, defaultValue)
- Parses environment variables as JSON arrays

getSolanaBalance(fromKeypair)
- Retrieves the SOL balance of a keypair

delay(ms)
- Delays execution for a specified number of milliseconds

listAccounts()
- Lists available accounts

main()
- Main function to execute the script

executeTransactions(selectedAccount, numTransactions, config)
- Executes transactions for a selected account
   ```
## Modules to Install
The script requires the following npm modules:

- @solana/web3.js
- bip39
- ed25519-hd-key
- bs58
- prompt
- dotenv

## Install these modules using:

```bash
npm install @solana/web3.js bip39 ed25519-hd-key bs58 prompt dotenv
```
## License

This project is licensed under the `NONE` License.

## Contact
If you have any questions or suggestions, please feel free to contact at [ https://t.me/itsjaw_real ].


