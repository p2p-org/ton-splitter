import "./lib";
import "./constants";

contract Splitter {
    managable: Address;
    members: map<Int,Int>;
    admin: Address;

    denominator: Int;
    withdrawFee: Int;

    // member change that will take place after withdrawal
    pendingMembersChange: MembersChangeInfo?;

    init(managable: Address, admin: Address, members: map<Int,Int>, denominator: Int, withdrawFee: Int) {
        self.managable = managable;
        self.members = members;
        self.admin = admin;
        self.denominator = denominator;
        self.withdrawFee = withdrawFee;
    }

    fun splitAndSend(value: Int) {
        let splittable: Int = value / self.denominator * self.denominator;

        if (splittable <= 0) { // if cannot split
            return;
        }

        let lookup: DictLookupResult = nativeDictGetMin(self.members, 257);
        while (lookup.found) {
            let memberSlice: Slice = lookup.value!!;
            let memberShare: Int = memberSlice.loadInt(257);

            let memberAddress: Address = serlializeAddress(0, lookup.key!!);
            
            let body: StringBuilder = beginComment();
            body.append(memberShare.toString());
            body.append("/");
            body.append(self.denominator.toString());
            body.append(" of ");
            body.append(splittable.toCoinsString());
            body.append(" (whales revenue share)");

            send(SendParameters{
                to: memberAddress,
                value: splittable / self.denominator * memberShare,
                mode: 0,
                bounce: false,
                body: body.toCell()
            });

            lookup = nativeDictGetNext(self.members, 257, lookup.key!!);
        }
    }

    receive(command: PoolCommandMessage) {
        let ctx: Context = context();

        require(ctx.sender == self.admin, "Admin only");

        send(SendParameters{
            to: self.managable,
            value: command.value,
            mode: command.mode,
            bounce: command.bounce,
            body: command.body
        });
    }

    receive(membersChange: MembersChangeMessage) {
        let ctx: Context = context();

        require(ctx.sender == self.admin, "Admin only");

        self.pendingMembersChange = MembersChangeInfo{
            members: membersChange.members,
            denominator: membersChange.denominator
        };
    }

    // change admin
    receive(changeAdmin: ChangeAdminMessage) {
        let ctx: Context = context();

        require(ctx.sender == self.admin, "Admin only");

        self.admin = changeAdmin.newAdmin;
    }

    receive("Topup DAO") {
        // do nothing
    }

    receive("Terminated") {
        // Do nothing
    }

    receive("Withdraw") {
        let ctx: Context = context();
        
        let parsedAddr: ParsedAddress = parseAddress(ctx.sender);
        let maybeMember: Int? = self.members.get(parsedAddr.hash);
        require(maybeMember != null || ctx.sender == self.admin, "You are not a member or admin");

        require(myBalance() - self.withdrawFee > DAO_MINIMUM_BALANCE, "Not enough balance to withdraw");

        send(SendParameters{
            to: self.managable,
            value: self.withdrawFee,
            mode: 1,
            bounce: false,
            body: WithdrawStake{
                queryId: random(1, 18446744073709552000),
                gasLimit: 1000000000,
                stake: 0
            }.toCell()
        });
    }

    receive("Gift") {
        let ctx: Context = context();

        let value: Int = ctx.value - DAO_MINIMUM_BALANCE; // Processing fee
        if (value <= 0) {
            return;
        }

        self.splitAndSend(value);
    }

    receive(msg: WithdrawStakeResponse) {
        let ctx: Context = context();

        let value: Int = ctx.value - DAO_MINIMUM_BALANCE; // Processing fee

        if (value > 0){
            self.splitAndSend(value);
        }

        if (self.pendingMembersChange != null){
            self.members = (self.pendingMembersChange!!).members;
            self.denominator = (self.pendingMembersChange!!).denominator;
            self.pendingMembersChange = null;
        }
    }

    receive(msg: WithdrawStakeDelayed) {
        let ctx: Context = context();

        let value: Int = ctx.value - DAO_MINIMUM_BALANCE; // Processing fee
        if (value <= 0) {
            return;
        }

        self.splitAndSend(value);
    }

    get fun memberShare(addr: Address): Int {
        let parsedAddr: ParsedAddress = parseAddress(addr);
        let maybeMember: Int? = self.members.get(parsedAddr.hash);
        require(maybeMember != null, "You are not a member");
        return maybeMember!!;
    }

    get fun membersCount(): Int {
        let count: Int = 0;
        let lookup: DictLookupResult = nativeDictGetMin(self.members, 257);
        while (lookup.found) {
            let memberSlice: Slice = lookup.value!!;
            let memberShare: Int = memberSlice.loadInt(257);

            count = count + 1;
            lookup = nativeDictGetNext(self.members, 257, lookup.key!!);
        }

        return count;
    }

    get fun members(): map<Int,Int> {
        return self.members;
    }
}