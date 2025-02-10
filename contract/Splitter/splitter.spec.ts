import { Address, beginCell, comment, Dictionary, toNano } from "ton";
import { ContractSystem, Treasure } from "ton-emulator";
import { Splitter, storePoolCommandMessage, storeWithdrawStake, WithdrawStake } from "./output/splitter_Splitter";
import assert from "assert";

describe("Splitter", () => {
    it("should split revenue correctly", async () => {
        // Create ContractSystem and deploy contract
        const system = await ContractSystem.create();

        const managable = system.treasure("managable");
        const admin = system.treasure("admin");
        const owner = system.treasure("owner");
        const nonOwner = system.treasure("non-owner");

        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt("0x" + owner.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + nonOwner.address.hash.toString("hex")), 1n);

        const contract = system.open(
            await Splitter.fromInit(managable.address, admin.address, members, 2n, 200000000n)
        );
        const track = system.track(contract.address);
        await system.run();

        track.events();

        // Check splitter
        await contract.send(
            managable,
            {
                value: toNano(2) + 100_000_000n,
            },
            "Gift"
        );

        await system.run();
        expect(track.events()).toMatchSnapshot();
    });

    it("should split if withdraw delayed", async () => {
        let system = await ContractSystem.create();

        let managable = system.treasure("managable");
        const admin = system.treasure("admin");
        let owner = system.treasure("owner");
        let nonOwner = system.treasure("non-owner");
        let nonOwner2 = system.treasure("non-owner 2");

        let members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt("0x" + owner.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + nonOwner.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + nonOwner2.address.hash.toString("hex")), 1n);

        let contract = system.open(await Splitter.fromInit(managable.address, admin.address, members, 3n, 200000000n));
        let track = system.track(contract.address);

        await system.run();
        track.events();

        const amount = toNano(10);
        await contract.send(
            managable,
            {
                value: amount,
                bounce: false,
            },
            {
                $$type: "WithdrawStakeDelayed",
                queryId: 228n,
            }
        );

        await system.run();
        expect(track.events()).toMatchSnapshot();
    });

    it("should split if zero balance", async () => {
        let system = await ContractSystem.create();

        let managable = system.treasure("managable");
        const admin = system.treasure("admin");
        let owner = system.treasure("owner");
        let nonOwner = system.treasure("non-owner");
        let nonOwner2 = system.treasure("non-owner 2");

        let members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt("0x" + owner.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + nonOwner.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + nonOwner2.address.hash.toString("hex")), 1n);

        let contract = system.open(await Splitter.fromInit(managable.address, admin.address, members, 3n, 200000000n));
        let track = system.track(contract.address);

        await system.run();
        track.events();

        const amount = toNano(10);
        await contract.send(
            managable,
            {
                value: amount,
                bounce: false,
            },
            {
                $$type: "WithdrawStakeResponse",
                queryId: 228n,
            }
        );

        await system.run();
        expect(track.events()).toMatchSnapshot();
    });

    it("should execute admin commands", async () => {
        const system = await ContractSystem.create();

        const managable = system.treasure("managable");
        const admin = system.treasure("admin");

        // empty members
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));

        const contract = system.open(
            await Splitter.fromInit(managable.address, admin.address, members, 3n, 200000000n)
        );

        const track = system.track(contract.address);

        await system.run();
        track.events();

        /** Forming the message for pool */
        const dataToSend = beginCell()
            .storeUint(123, 32) // op
            .storeUint(123, 64) // query id
            .storeCoins(toNano(10)) // gas limits
            .storeUint(123321123n, 128) // some payload
            .endCell();

        /** Forming the command for splitter */
        const poolCommandBuilder = beginCell();
        storePoolCommandMessage({
            $$type: "PoolCommandMessage",
            queryId: 123n,
            value: 500_000_000n,
            mode: 0n,
            bounce: true,
            body: dataToSend,
        })(poolCommandBuilder);
        const poolCommandMessage = poolCommandBuilder.endCell();

        // sending the command
        await contract.send(
            admin,
            {
                value: toNano(1),
                bounce: true,
            },
            {
                $$type: "PoolCommandMessage",
                queryId: 123n,
                value: 500_000_000n,
                mode: 0n,
                bounce: true,
                body: dataToSend,
            }
        );

        await system.run();
        const events = track.events();

        /** Splitter received the command */
        const toSplitterFromAdming = events.find(
            (e) =>
                e.type === "received" &&
                e.message.type === "internal" &&
                e.message.from === admin.address.toString({ testOnly: true, bounceable: true }) &&
                e.message.to === contract.address.toString({ testOnly: true, bounceable: true })
        );
        assert(toSplitterFromAdming);
        assert(toSplitterFromAdming.type === "received");
        assert(toSplitterFromAdming.message.type === "internal");
        assert(toSplitterFromAdming.message.body.type === "cell");
        expect(toSplitterFromAdming.message.body.cell).toEqual(poolCommandMessage.toString());

        /** Splitter sends the command's body to pool */
        const toPoolFromSplitter = events.find((e) => e.type === "sent" && e.messages.length === 1);
        assert(toPoolFromSplitter);
        assert(toPoolFromSplitter.type === "sent");
        assert(toPoolFromSplitter.messages.length === 1);
        const message = toPoolFromSplitter.messages[0];
        assert(message.type === "internal");
        expect(message.from).toEqual(contract.address.toString({ testOnly: true, bounceable: true }));
        expect(message.to).toEqual(managable.address.toString({ testOnly: true, bounceable: true }));
        assert(message.body.type === "cell");
        expect(message.body.cell).toEqual(dataToSend.toString());
    });

    it("should change members", async () => {
        const system = await ContractSystem.create();

        const managable = system.treasure("managable");
        const admin = system.treasure("admin");

        /** Initial members */
        const member1 = system.treasure("member1");
        const member2 = system.treasure("member2");
        const member3 = system.treasure("member3");

        /** Members dictionary */
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt("0x" + member1.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + member2.address.hash.toString("hex")), 2n);
        members.set(BigInt("0x" + member3.address.hash.toString("hex")), 3n);

        const contract = system.open(
            await Splitter.fromInit(managable.address, admin.address, members, 6n, 200000000n)
        );
        const track = system.track(contract.address);
        const tx = await system.run();
        track.events();

        // send some message to deploy the contract
        await contract.send(member1, { value: toNano(1) }, "Gift");

        await system.run();

        const membersBefore = await contract.getMembers();

        /** Check members before */
        expect(membersBefore.size).toBe(3);
        expect(membersBefore.get(BigInt("0x" + member1.address.hash.toString("hex")))).toBe(1n);
        expect(membersBefore.get(BigInt("0x" + member2.address.hash.toString("hex")))).toBe(2n);
        expect(membersBefore.get(BigInt("0x" + member3.address.hash.toString("hex")))).toBe(3n);

        /** New members */
        const member4 = system.treasure("member4");
        const member5 = system.treasure("member5");
        const member6 = system.treasure("member6");
        const member7 = system.treasure("member7");

        /** New members dictionary */
        const newMembers = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        newMembers.set(BigInt("0x" + member4.address.hash.toString("hex")), 1n);
        newMembers.set(BigInt("0x" + member5.address.hash.toString("hex")), 2n);
        newMembers.set(BigInt("0x" + member6.address.hash.toString("hex")), 3n);
        newMembers.set(BigInt("0x" + member7.address.hash.toString("hex")), 4n);

        /** Send new members */
        await contract.send(
            admin,
            { value: toNano(1) },
            {
                $$type: "MembersChangeMessage",
                members: newMembers,
                queryId: 123n,
                gasLimit: toNano(1),
                denominator: 10n,
            }
        );
        await system.run();

        /** Mock pool withdrawal */
        await contract.send(
            managable,
            { value: toNano(100) },
            {
                $$type: "WithdrawStakeResponse",
                queryId: 123n,
            }
        );
        await system.run();

        const membersAfter = await contract.getMembers();

        /** Check members after */
        expect(membersAfter.size).toBe(4);
        expect(membersAfter.get(BigInt("0x" + member4.address.hash.toString("hex")))).toBe(1n);
        expect(membersAfter.get(BigInt("0x" + member5.address.hash.toString("hex")))).toBe(2n);
        expect(membersAfter.get(BigInt("0x" + member6.address.hash.toString("hex")))).toBe(3n);
        expect(membersAfter.get(BigInt("0x" + member7.address.hash.toString("hex")))).toBe(4n);
    });

    it("should let only members and admin withdraw", async () => {
        const system = await ContractSystem.create();

        const managable = system.treasure("managable");
        const admin = system.treasure("admin");

        /** Initial members */
        const member1 = system.treasure("member1");
        const member2 = system.treasure("member2");
        const member3 = system.treasure("member3");

        /** Members dictionary */
        const members = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        members.set(BigInt("0x" + member1.address.hash.toString("hex")), 1n);
        members.set(BigInt("0x" + member2.address.hash.toString("hex")), 2n);
        members.set(BigInt("0x" + member3.address.hash.toString("hex")), 3n);

        const WITHDRAW_FEE = 200000000n;

        const contract = system.open(
            await Splitter.fromInit(managable.address, admin.address, members, 6n, WITHDRAW_FEE)
        );
        const track = system.track(contract.address);
        const tx = await system.run();
        track.events();

        const randomAddress = system.treasure("random");

        await contract.send(randomAddress, { value: WITHDRAW_FEE + toNano(1) }, "Withdraw");
        await system.run();
        expect(track.events()).toMatchSnapshot();

        await contract.send(member1, { value: WITHDRAW_FEE + toNano(1) }, "Withdraw");
        await system.run();
        expect(track.events()).toMatchSnapshot();

        await contract.send(admin, { value: WITHDRAW_FEE + toNano(1) }, "Withdraw");
        await system.run();
        expect(track.events()).toMatchSnapshot();
    });
});
