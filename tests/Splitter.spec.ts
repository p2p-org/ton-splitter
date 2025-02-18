import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, Dictionary, toNano } from '@ton/core';
import { Splitter } from '../wrappers/Splitter';
import '@ton/test-utils';
import assert from 'assert';

describe('Splitter', () => {
    let blockchain: Blockchain;
    let admin: SandboxContract<TreasuryContract>;
    let managable: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        admin = await blockchain.treasury('admin');
        managable = await blockchain.treasury('managable');
    });

    it('should split revenue correctly', async () => {
        const member1 = await blockchain.treasury('member1');
        const member2 = await blockchain.treasury('member2');

        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt('0x' + member1.address.hash.toString('hex')), 1n);
        members.set(BigInt('0x' + member2.address.hash.toString('hex')), 1n);
        const totalShare = 2n;

        const withdrawFee = toNano('0.2');

        const splitter = blockchain.openContract(
            await Splitter.fromInit(managable.address, admin.address, members, totalShare, withdrawFee),
        );

        const value = toNano(2);

        const result = await splitter.send(
            managable.getSender(),
            {
                value: value + toNano(0.1), // + fee
            },
            'Gift',
        );

        const giftTransaction = result.transactions[1];
        assert(giftTransaction.description.type === 'generic');
        assert(giftTransaction.description.actionPhase);
        const totalOutForwardFee = giftTransaction.description.actionPhase.totalFwdFees;
        assert(totalOutForwardFee);

        const received = (value - totalOutForwardFee) / 2n;

        /** Members received their share */
        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: member1.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: member2.address,
            value: received,
        });
    });

    it('should split if withdraw delayed', async () => {
        const member1 = await blockchain.treasury('member1');
        const member2 = await blockchain.treasury('member2');
        const member3 = await blockchain.treasury('member3');

        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt('0x' + member1.address.hash.toString('hex')), 1n);
        members.set(BigInt('0x' + member2.address.hash.toString('hex')), 1n);
        members.set(BigInt('0x' + member3.address.hash.toString('hex')), 1n);
        const totalShare = 3n;

        const withdrawFee = toNano('0.2');
        const splitter = blockchain.openContract(
            await Splitter.fromInit(managable.address, admin.address, members, totalShare, withdrawFee),
        );

        const amount = toNano(10);
        const result = await splitter.send(
            managable.getSender(),
            {
                value: amount + toNano(0.1), // + fee
                bounce: false,
            },
            {
                $$type: 'WithdrawStakeDelayed',
                queryId: 123n,
            },
        );

        const withdrawTx = result.transactions[1];
        assert(withdrawTx.description.type === 'generic');
        assert(withdrawTx.description.actionPhase);
        const totalOutForwardFee = withdrawTx.description.actionPhase.totalFwdFees;
        assert(totalOutForwardFee);

        const received = (amount - totalOutForwardFee) / 3n;

        /** Members received their share */
        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: member1.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: member2.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: member3.address,
            value: received,
        });
    });

    it('should execute admin commands', async () => {
        // empty members
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));

        const withdrawFee = toNano('0.2');

        const splitter = blockchain.openContract(
            await Splitter.fromInit(managable.address, admin.address, members, 0n, withdrawFee),
        );

        /** Forming the message for pool */
        const dataToSend = beginCell()
            .storeUint(123, 32) // op
            .storeUint(123, 64) // query id
            .storeCoins(toNano(10)) // gas limits
            .storeUint(123321123n, 128) // some payload
            .endCell();

        // sending the command
        const result = await splitter.send(
            admin.getSender(),
            {
                value: toNano(1),
                bounce: true,
            },
            {
                $$type: 'PoolCommandMessage',
                queryId: 123n,
                value: 500_000_000n,
                mode: 1n,
                bounce: true,
                body: dataToSend,
            },
        );

        expect(result.transactions).toHaveTransaction({
            from: splitter.address,
            to: managable.address,
            value: 500_000_000n,
            body: dataToSend,
        });
    });

    it('should change members', async () => {
        const withdrawFee = toNano('0.2');

        /** Initial members */
        const member1 = await blockchain.treasury('member1');
        const member2 = await blockchain.treasury('member2');
        const member3 = await blockchain.treasury('member3');

        /** Members dictionary */
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt('0x' + member1.address.hash.toString('hex')), 1n);
        members.set(BigInt('0x' + member2.address.hash.toString('hex')), 2n);
        members.set(BigInt('0x' + member3.address.hash.toString('hex')), 3n);

        const contract = blockchain.openContract(
            await Splitter.fromInit(managable.address, admin.address, members, 6n, withdrawFee),
        );

        // send some message to deploy the contract
        await contract.send(member1.getSender(), { value: toNano(1) }, 'Gift');

        const membersBefore = await contract.getMembers();

        /** Check members before */
        expect(membersBefore.size).toBe(3);
        expect(membersBefore.get(BigInt('0x' + member1.address.hash.toString('hex')))).toBe(1n);
        expect(membersBefore.get(BigInt('0x' + member2.address.hash.toString('hex')))).toBe(2n);
        expect(membersBefore.get(BigInt('0x' + member3.address.hash.toString('hex')))).toBe(3n);

        /** New members */
        const member4 = await blockchain.treasury('member4');
        const member5 = await blockchain.treasury('member5');
        const member6 = await blockchain.treasury('member6');
        const member7 = await blockchain.treasury('member7');

        /** New members dictionary */
        const newMembers = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        newMembers.set(BigInt('0x' + member4.address.hash.toString('hex')), 1n);
        newMembers.set(BigInt('0x' + member5.address.hash.toString('hex')), 2n);
        newMembers.set(BigInt('0x' + member6.address.hash.toString('hex')), 3n);
        newMembers.set(BigInt('0x' + member7.address.hash.toString('hex')), 4n);

        /** Send new members */
        await contract.send(
            admin.getSender(),
            { value: toNano(1) },
            {
                $$type: 'MembersChangeMessage',
                members: newMembers,
                queryId: 123n,
                gasLimit: toNano(1),
                denominator: 10n,
            },
        );

        /** Mock pool withdrawal */
        await contract.send(
            managable.getSender(),
            { value: toNano(100) },
            {
                $$type: 'WithdrawStakeResponse',
                queryId: 123n,
            },
        );

        const membersAfter = await contract.getMembers();

        /** Check members after */
        expect(membersAfter.size).toBe(4);
        expect(membersAfter.get(BigInt('0x' + member4.address.hash.toString('hex')))).toBe(1n);
        expect(membersAfter.get(BigInt('0x' + member5.address.hash.toString('hex')))).toBe(2n);
        expect(membersAfter.get(BigInt('0x' + member6.address.hash.toString('hex')))).toBe(3n);
        expect(membersAfter.get(BigInt('0x' + member7.address.hash.toString('hex')))).toBe(4n);
    });

    it('should let only members and admin withdraw', async () => {
        /** Initial members */
        const member1 = await blockchain.treasury('member1');
        const member2 = await blockchain.treasury('member2');
        const member3 = await blockchain.treasury('member3');

        /** Members dictionary */
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt('0x' + member1.address.hash.toString('hex')), 1n);
        members.set(BigInt('0x' + member2.address.hash.toString('hex')), 2n);
        members.set(BigInt('0x' + member3.address.hash.toString('hex')), 3n);

        const WITHDRAW_FEE = 200000000n;

        const splitter = blockchain.openContract(
            await Splitter.fromInit(managable.address, admin.address, members, 6n, WITHDRAW_FEE),
        );

        const randomAddress = await blockchain.treasury('random');

        const randomWithdrawResult = await splitter.send(
            randomAddress.getSender(),
            { value: WITHDRAW_FEE + toNano(1) },
            'Withdraw',
        );
        expect(randomWithdrawResult.transactions).toHaveTransaction({
            from: randomAddress.address,
            to: splitter.address,
            success: false,
        });

        const memberWithdrawResult = await splitter.send(
            member1.getSender(),
            { value: WITHDRAW_FEE + toNano(1) },
            'Withdraw',
        );
        expect(memberWithdrawResult.transactions).toHaveTransaction({
            from: member1.address,
            to: splitter.address,
            success: true,
        });

        const adminWithdrawResult = await splitter.send(
            admin.getSender(),
            { value: WITHDRAW_FEE + toNano(1) },
            'Withdraw',
        );
        expect(adminWithdrawResult.transactions).toHaveTransaction({
            from: admin.address,
            to: splitter.address,
            success: true,
        });
    });
});
