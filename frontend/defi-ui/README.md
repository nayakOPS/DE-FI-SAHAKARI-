# Decentralized Sahakari (De-Sahakari)

## Project Description
Decentralized Sahakari is a decentralized cooperative (sahakari) application developed using Solidity smart contracts on the Ethereum blockchain testnet (Sepolia). The project aims to automate and enforce cooperative rules to enhance member trust and ensure transparency, immutability, and efficient management without intermediaries. Core features include lending/borrowing USDC, utilizing ETH as collateral to borrow USDC, and earning interest on deposits.

## Features
- **Member Registration**: Users can register on the platform by providing necessary details and connecting their Metamask wallet.
- **Fund Handling**: Deposit and withdrawal of funds, tracking member balances and total cooperative funds.
- **Loan Processing**: Manage loan requests, approvals, disbursements, and repayments.
- **Real-Time ETH Price Fetching**: Fetches real-time ETH prices using blockchain oracles to calculate the required ETH collateral value for loans.

## Installation Instructions
1. **Clone the Repository**:
    ```sh
    git clone https://github.com/nayakOPS/DE-FI-SAHAKARI-.git
    cd DE-FI-SAHAKARI-/frontend/defi-ui
    ```

2. **Install Dependencies**:
    ```sh
    npm install
    ```

3. **Run the Development Server**:
    ```sh
    npm run dev
    ```

4. **Open the Application**:
    Open your browser and navigate to the provided local development URL (e.g., `http://localhost:3000`).

**Note**: You must have Metamask installed and configured to use this application.

## Usage Instructions
- **Register as a Member**: Connect your Metamask wallet and register by providing necessary details.
- **Deposit Funds**: Deposit USDC into your cooperative account.
- **Request a Loan**: Request a loan by providing the necessary details and collateral.
- **Admin Functions**: Admins can approve loan requests, disburse loans, and manage repayments.
- **View Balances and Loan Status**: Check your balances, loan details, and repayment status.

## Technologies Used
- **Frontend**:
  - React
  - Vite
  - TailwindCSS
  - ethers.js
  - react-router-dom

- **Backend**:
  - Solidity Smart Contracts
  - Ethereum blockchain (Sepolia testnet)



## Contributing Guidelines
We welcome contributions from the community. To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.

Please ensure your code follows our coding guidelines and includes relevant tests.
