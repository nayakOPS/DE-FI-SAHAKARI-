# Decentralized Sahakari (De-Sahakari)
# De-Sahakari Backend

## Project Description
This folder contains the backend for the Decentralized Sahakari (De-Sahakari) project. The backend is responsible for managing the smart contracts deployed on the Ethereum blockchain. The contracts handle functionalities like member registration, fund handling, loan processing, and real-time ETH price fetching. The project leverages Solidity for smart contract development and Thirdweb for deployment and contract management.


## Installation Instructions
1. **Clone the Repository**:
    ```sh
    git clone https://github.com/nayakOPS/DE-FI-SAHAKARI-.git
    cd DE-FI-SAHAKARI-/backend/sahakari
    ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

## Usage Instructions
### Building the Project
After making any changes to the contracts, run the following command to compile the contracts:
```sh
npm run build
```

### Deploying Contracts
To deploy the smart contracts, run the following command:
```sh
npm run deploy
```

## Post-Deployment Steps
After deploying the contracts, copy the respective contract ABI from the `artifacts` folder. Use the ABI and contract address in the frontend to interact with the deployed contracts.

## Technologies Used
- **Solidity**: Smart contract programming language.
- **Thirdweb**: Used for contract deployment and management.
- **Hardhat**: Ethereum development environment.
- **Node.js**: JavaScript runtime.
- **NPM/Yarn**: Package managers.

## Contributing Guidelines
We welcome contributions from the community. To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

Please ensure your code follows our coding guidelines and includes relevant tests.

This `README.md` provides a comprehensive guide for setting up, building, deploying, and contributing to the backend of the De-Sahakari project. Let me know if there's anything more you'd like to include or modify!
