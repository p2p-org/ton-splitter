const PROPOSAL_MINIMUM_BALANCE: Int = 50000000;
const DAO_MINIMUM_BALANCE: Int = 100000000;

struct ProposedMessage {
    to: Address;
    value: Int;
    mode: Int;
    bounce: Bool;
    body: Cell;
}

message ExecuteProposal {
    messages: map<Int, ProposedMessage>;
}

message CreateProposal {
    queryId: Int as uint64;
    messages: map<Int, ProposedMessage>;
}

message(3665837821) WithdrawStake {
    queryId: Int as uint64;
    gasLimit: Int as coins;
    stake: Int as coins;
}

message(601104865) WithdrawStakeResponse {
    queryId: Int as uint64;
}

message(1958425639) WithdrawStakeDelayed {
    queryId: Int as uint64;
}
