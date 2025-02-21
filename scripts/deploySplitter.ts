import { Dictionary, toNano } from '@ton/core';
import { Splitter } from '../wrappers/Splitter';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    // input pool address
    const poolAddress = await ui.inputAddress('Enter the pool address: ');

    // input admin address
    const adminAddress = await ui.inputAddress('Enter the admin address: ');

    // Input the number of members
    const numberMembers = await ui.input('Enter the number of members: ');

    // check if numberMembers is a number
    if (isNaN(parseInt(numberMembers))) {
        ui.write('Invalid number of members');
        return;
    }

    const membersDict = Dictionary.empty(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
    let totalShares = 0;

    // Input the details for each member
    for (let i = 0; i < parseInt(numberMembers); i++) {
        ui.write(`Entering details for member ${i + 1}:`);

        const address = await ui.inputAddress(`Enter address for member ${i + 1}: `);
        const shareInput = await ui.input(`Enter share for member ${i + 1} (integer): `);

        // Validate share is a valid integer
        const share = parseInt(shareInput);
        if (isNaN(share) || share <= 0) {
            ui.write('Invalid share value. Must be a positive integer.');
            return;
        }

        membersDict.set(BigInt('0x' + address.hash.toString('hex')), BigInt(share));
        totalShares += share;
    }

    if (totalShares <= 0) {
        ui.write('Total shares must be greater than 0');
        return;
    }

    const withdrawalFeeInput = await ui.input('withdrawal fee (in full TON): ');

    // Validate withdrawal fee is a valid number
    const withdrawalFee = parseFloat(withdrawalFeeInput);
    if (isNaN(withdrawalFee) || withdrawalFee < 0) {
        ui.write('Invalid withdrawal fee. Must be a non-negative number.');
        return;
    }

    const splitter = provider.open(
        await Splitter.fromInit(
            poolAddress,
            adminAddress,
            membersDict,
            BigInt(totalShares),
            BigInt(toNano(withdrawalFee)),
        ),
    );

    // confirm the deployment
    ui.write(`Splitter deployed at ${splitter.address}`);
    ui.write(`Pool address: ${poolAddress}`);
    ui.write(`Admin address: ${adminAddress}`);
    ui.write(`Members: ${membersDict}`);
    ui.write(`Total shares: ${totalShares}`);
    ui.write(`Withdrawal fee: ${withdrawalFee}`);

    if (!(await ui.prompt('Confirm deployment? (y/n): '))) {
        ui.write('Deployment cancelled');
        return;
    }

    await splitter.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'Gift',
    );

    await provider.waitForDeploy(splitter.address);

    ui.write(`Splitter deployed at ${splitter.address}`);
}
