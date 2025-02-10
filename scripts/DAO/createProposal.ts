import { NetworkProvider, sleep, UIProvider } from '@ton/blueprint';
import { DAO_CODE_HASH, DAOWithSplitter, dictValueParserProposedMessage } from '../../wrappers/DAO';
import { beginCell, Dictionary, fromNano, OpenedContract, toNano } from '@ton/core';
import { Proposal } from '../../wrappers/DAOProposal';
import { parseDAOState } from '../../utils/dao';
import { validatePool } from '../../utils/pool';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    // Input the DAO contract address
    const daoAddress = await ui.inputAddress('Enter the DAO address: ');

    // Check if the contract is deployed
    if (!provider.isContractDeployed(daoAddress)) {
        ui.write('DAO contract is not deployed');
        return;
    }

    // Open the DAO contract
    const dao = provider.open(DAOWithSplitter.fromAddress(daoAddress));

    const proposalType = await ui.choose('Select proposal type:', ['Change pool parameters', 'Change owner'], (x) => x);

    switch (proposalType) {
        case 'Change pool parameters':
            await handleChangePoolParametersProposal(provider, ui, dao);
            break;
        case 'Change owner':
            await handleChangeOwnerProposal(provider, ui, dao);
            break;
        default:
            ui.write('Invalid proposal type');
            return;
    }
}

async function handleChangePoolParametersProposal(
    provider: NetworkProvider,
    ui: UIProvider,
    dao: OpenedContract<DAOWithSplitter>,
) {
    const daoAddress = dao.address;

    const { managable, members, denominator, withdrawFee: daoWithdrawFee } = await parseDAOState(provider, daoAddress);

    ui.write('--- DAO parameters ---');
    ui.write(`Managable: ${managable}`);
    ui.write(`Members: ${members}`);
    ui.write(`Denominator: ${denominator}`);
    ui.write(`Withdraw fee: ${daoWithdrawFee} (${fromNano(daoWithdrawFee)} TON)`);

    /** Validate pool contract */
    await validatePool(provider, managable, daoAddress);

    /** Get pool params */
    const poolParamsResult = await provider.provider(managable).get('get_params', []);
    const enabledInitial = poolParamsResult.stack.readBoolean();
    const updatesEnabledInitial = poolParamsResult.stack.readBoolean();
    const minStakeInitial = poolParamsResult.stack.readBigNumber();
    const depositFeeInitial = poolParamsResult.stack.readBigNumber();
    const withdrawFeeInitial = poolParamsResult.stack.readBigNumber();
    const poolFeeInitial = poolParamsResult.stack.readBigNumber();
    const receiptPriceInitial = poolParamsResult.stack.readBigNumber();
    ui.write('--- Current pool params ---');
    ui.write(`Enabled: ${enabledInitial}`);
    ui.write(`Updates enabled: ${updatesEnabledInitial}`);
    ui.write(`Min stake: ${minStakeInitial} (${fromNano(minStakeInitial)} TON)`);
    ui.write(`Deposit fee: ${depositFeeInitial} (${fromNano(depositFeeInitial)} TON)`);
    ui.write(`Withdraw fee: ${withdrawFeeInitial} (${fromNano(withdrawFeeInitial)} TON)`);
    ui.write(`Pool fee: ${poolFeeInitial}`);
    ui.write(`Receipt price: ${receiptPriceInitial} (${fromNano(receiptPriceInitial)} TON)`);

    let enabled = enabledInitial;
    let updatesEnabled = updatesEnabledInitial;
    let minStake = minStakeInitial;
    let depositFee = depositFeeInitial;
    let withdrawFee = withdrawFeeInitial;
    let poolFee = poolFeeInitial;
    let receiptPrice = receiptPriceInitial;

    do {
        const parameterToChange = await ui.choose(
            'Select parameter to change:',
            ['Enabled', 'Updates enabled', 'Min stake', 'Deposit fee', 'Withdraw fee', 'Pool fee', 'Receipt price'],
            (x) => x,
        );

        switch (parameterToChange) {
            case 'Enabled':
                enabled = await ui.prompt('Enable pool? Y for true, n for false');
                break;
            case 'Updates enabled':
                updatesEnabled = await ui.prompt('Enable updates? Y for true, n for false');
                break;
            case 'Min stake':
                minStake = BigInt(await ui.input('Enter the new min stake (in grams):'));
                break;
            case 'Deposit fee':
                depositFee = BigInt(await ui.input('Enter the new deposit fee (in grams):'));
                break;
            case 'Withdraw fee':
                withdrawFee = BigInt(await ui.input('Enter the new withdraw fee (in grams):'));
                break;
            case 'Pool fee':
                poolFee = BigInt(await ui.input('Enter the new pool fee (in basis points):'));
                break;
            case 'Receipt price':
                receiptPrice = BigInt(await ui.input('Enter the new receipt price (in grams):'));
                break;
        }

        ui.write('--- Modified pool parameters ---');
        ui.write(`Enabled: ${enabled}`);
        ui.write(`Updates enabled: ${updatesEnabled}`);
        ui.write(`Min stake: ${minStake} (${fromNano(minStake)} TON)`);
        ui.write(`Deposit fee: ${depositFee} (${fromNano(depositFee)} TON)`);
        ui.write(`Withdraw fee: ${withdrawFee} (${fromNano(withdrawFee)} TON)`);
        ui.write(`Pool fee: ${poolFee}`);
        ui.write(`Receipt price: ${receiptPrice} (${fromNano(receiptPrice)} TON)`);
    } while (await ui.prompt('Keep chaning parameters?'));

    const messages = Dictionary.empty(Dictionary.Keys.BigUint(257), dictValueParserProposedMessage());
    messages.set(BigInt(0), {
        $$type: 'ProposedMessage',
        to: managable,
        value: toNano('5'),
        mode: 1n,
        bounce: false,
        body: beginCell()
            .storeUint(37541164, 32) // op code update extra params
            .storeUint(Date.now(), 64)
            .storeCoins(toNano('5'))
            .storeRef(
                beginCell()
                    .storeBit(enabled) // Store Enabled as 1 bit
                    .storeBit(updatesEnabled) // Store UpgradesEnabled as 1 bit
                    .storeCoins(minStake) // Store minimum stake
                    .storeCoins(depositFee) // Store deposit fee
                    .storeCoins(withdrawFee) // Store withdraw fee
                    .storeCoins(poolFee) // Store new pool fee
                    .storeCoins(receiptPrice) // Store receipt price
                    .endCell(),
            )
            .endCell(),
    });

    const votesNeeded = await dao.getMinimumVotes();

    const proposal = await Proposal.fromInit(daoAddress, votesNeeded, members, messages);

    const proposalAddress = proposal.address;

    if (await provider.isContractDeployed(proposalAddress)) {
        ui.write('Proposal already exists');
        return;
    }

    ui.write('--- Confirm parameters ---');
    ui.write(`Enabled: ${enabled}`);
    ui.write(`Updates enabled: ${updatesEnabled}`);
    ui.write(`Min stake: ${minStake}`);
    ui.write(`Deposit fee: ${depositFee}`);
    ui.write(`Withdraw fee: ${withdrawFee}`);
    ui.write(`Pool fee: ${poolFee}`);
    ui.write(`Receipt price: ${receiptPrice}`);

    if (!(await ui.prompt(`Confirm parameters? The proposal will be deployed at ${proposalAddress}`))) {
        ui.write('Proposal creation cancelled');
        return;
    }
    ui.write('Creating proposal...');
    await dao.send(
        provider.sender(),
        { value: toNano('0.15') },
        {
            $$type: 'CreateProposal',
            queryId: BigInt(Math.floor(Date.now() / 1000)),
            messages: messages,
        },
    );

    // sleep 5 secs to make sure the proposal is deployed
    await sleep(5000);
    ui.write(
        'Chaning parameters in the pool requires 5 TON. Make sure DAO has at least 6 TON before the proposal is executed',
    );
    ui.write(
        `Proposal created at ${proposalAddress}. Any member can now vote on it. Send a message to the proposal address with comment either "Agree" or "Disagree" to vote.`,
    );
}

async function handleChangeOwnerProposal(
    provider: NetworkProvider,
    ui: UIProvider,
    dao: OpenedContract<DAOWithSplitter>,
) {
    const daoAddress = dao.address;

    const {
        managable,
        members,
        denominator,
        withdrawFee: daoWithdrawFee,
        codeHash: daoCodeHash,
    } = await parseDAOState(provider, daoAddress);

    ui.write('--- DAO parameters ---');
    ui.write(`Managable: ${managable}`);
    ui.write(`Members: ${members}`);
    ui.write(`Denominator: ${denominator}`);
    ui.write(`Withdraw fee: ${daoWithdrawFee} (${fromNano(daoWithdrawFee)} TON)`);

    /** Validate pool contract */
    await validatePool(provider, managable, daoAddress);

    const currentOwnerResult = await provider.provider(managable).get('get_owner', []);
    const currentOwner = currentOwnerResult.stack.readAddress();

    ui.write(`Current owner: ${currentOwner}`);

    const newOwner = await ui.inputAddress('Enter the new owner address: ');

    // check if new owner is deployed
    if (!(await provider.isContractDeployed(newOwner))) {
        ui.write('New owner is not deployed');
        return;
    }

    // check if new owner is a DAO
    if (daoCodeHash.toString('hex') !== DAO_CODE_HASH) {
        ui.write('New owner is not a DAO contract. Code hash did not match.');
        if (!(await ui.prompt('Continue anyway?'))) {
            ui.write('Proposal creation cancelled');
            return;
        }
    }

    const messages = Dictionary.empty(Dictionary.Keys.BigUint(257), dictValueParserProposedMessage());
    messages.set(BigInt(0), {
        $$type: 'ProposedMessage',
        to: managable,
        value: toNano('0.1'),
        mode: 1n,
        bounce: false,
        body: beginCell()
            .storeUint(2431318753, 32) // op code change address
            .storeUint(Date.now(), 64)
            .storeCoins(toNano('0.1'))
            .storeUint(0, 8) // id: 0 for owner, 1 for controller
            .storeAddress(newOwner)
            .endCell(),
    });

    const votesNeeded = await dao.getMinimumVotes();

    const proposal = await Proposal.fromInit(daoAddress, votesNeeded, members, messages);

    const proposalAddress = proposal.address;

    if (await provider.isContractDeployed(proposalAddress)) {
        ui.write('Proposal already exists');
        return;
    }

    if (!(await ui.prompt(`Confirm creating a proposal to change owner to ${newOwner}?`))) {
        ui.write('Proposal creation cancelled');
        return;
    }
    ui.write('Creating proposal...');
    await dao.send(
        provider.sender(),
        { value: toNano('0.15') },
        {
            $$type: 'CreateProposal',
            queryId: BigInt(Math.floor(Date.now() / 1000)),
            messages: messages,
        },
    );

    // sleep 5 secs to make sure the proposal is deployed
    await sleep(5000);

    ui.write(
        `Proposal created at ${proposalAddress}. Any member can now vote on it. Send a message to the proposal address with comment either "Agree" or "Disagree" to vote.`,
    );
}
