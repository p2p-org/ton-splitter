import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Dictionary, toNano } from '@ton/core';
import { DAOWithSplitter } from '../wrappers/DAO';
import '@ton/test-utils';
import assert from 'assert';

describe('DAO', () => {
    let blockchain: Blockchain;
    let managable: SandboxContract<TreasuryContract>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

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

        const dao = blockchain.openContract(
            await DAOWithSplitter.fromInit(managable.address, members, totalShare, withdrawFee),
        );

        const value = toNano(2);

        const result = await dao.send(
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
            from: dao.address,
            to: member1.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: dao.address,
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
        const dao = blockchain.openContract(
            await DAOWithSplitter.fromInit(managable.address, members, totalShare, withdrawFee),
        );

        const amount = toNano(10);
        const result = await dao.send(
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
            from: dao.address,
            to: member1.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: dao.address,
            to: member2.address,
            value: received,
        });
        expect(result.transactions).toHaveTransaction({
            from: dao.address,
            to: member3.address,
            value: received,
        });
    });

    it('should let only members withdraw', async () => {
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

        const dao = blockchain.openContract(
            await DAOWithSplitter.fromInit(managable.address, members, 6n, WITHDRAW_FEE),
        );

        const randomAddress = await blockchain.treasury('random');

        const randomWithdrawResult = await dao.send(
            randomAddress.getSender(),
            { value: WITHDRAW_FEE + toNano(1) },
            'Withdraw',
        );
        expect(randomWithdrawResult.transactions).toHaveTransaction({
            from: randomAddress.address,
            to: dao.address,
            success: false,
        });

        const memberWithdrawResult = await dao.send(
            member1.getSender(),
            { value: WITHDRAW_FEE + toNano(1) },
            'Withdraw',
        );
        expect(memberWithdrawResult.transactions).toHaveTransaction({
            from: member1.address,
            to: dao.address,
            success: true,
        });
    });
});
