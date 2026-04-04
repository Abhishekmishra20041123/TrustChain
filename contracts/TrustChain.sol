// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TrustChain {
    enum LoanStatus { Pending, Funded, Repaid }

    struct Loan {
        uint256 id;
        address borrower;
        uint256 amount;
        string purpose;
        LoanStatus status;
        address funder;
    }

    struct User {
        bool isRegistered;
        uint256 trustScore;
    }

    mapping(address => User) public users;
    mapping(uint256 => Loan) public loans;
    
    uint256 public loanCounter;

    event LoanRequested(uint256 indexed loanId, address indexed borrower, uint256 amount, string purpose);
    event LoanFunded(uint256 indexed loanId, address indexed funder, uint256 amount);
    event UserRegistered(address indexed user, uint256 initialTrustScore);

    // Modifier to check if user exists
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User not registered");
        _;
    }

    // Register a new user on the platform
    function registerUser(uint256 _initialTrustScore) public {
        require(!users[msg.sender].isRegistered, "User already registered");
        users[msg.sender] = User({
            isRegistered: true,
            trustScore: _initialTrustScore
        });
        emit UserRegistered(msg.sender, _initialTrustScore);
    }

    // Borrowers request loans
    function requestLoan(uint256 _amount, string memory _purpose) public onlyRegistered {
        require(_amount > 0, "Amount must be greater than 0");
        
        uint256 newLoanId = loanCounter;
        loans[newLoanId] = Loan({
            id: newLoanId,
            borrower: msg.sender,
            amount: _amount,
            purpose: _purpose,
            status: LoanStatus.Pending,
            funder: address(0)
        });

        loanCounter++;
        emit LoanRequested(newLoanId, msg.sender, _amount, _purpose);
    }

    // Lenders fund the loan
    function fundLoan(uint256 _loanId) public payable onlyRegistered {
        Loan storage loanToFund = loans[_loanId];
        
        require(loanToFund.status == LoanStatus.Pending, "Loan is not available for funding");
        require(msg.value == loanToFund.amount, "Must send exact loan amount");
        require(msg.sender != loanToFund.borrower, "Borrowers cannot fund their own loans");

        loanToFund.status = LoanStatus.Funded;
        loanToFund.funder = msg.sender;

        // Transfer funds directly to the borrower
        payable(loanToFund.borrower).transfer(msg.value);

        // Positive action boosts lender trust slightly
        users[msg.sender].trustScore += 2;

        emit LoanFunded(_loanId, msg.sender, msg.value);
    }

    // Fetch total active loans
    function getLoanCount() public view returns (uint256) {
        return loanCounter;
    }
}
