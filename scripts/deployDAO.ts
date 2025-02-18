import { NetworkProvider } from '@ton/blueprint';
import { Dictionary, toNano } from '@ton/core';
import { DAOWithSplitter } from '../wrappers/DAO';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    // input pool address
    const poolAddress = await ui.inputAddress('Enter the pool address: ');

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

        totalShares += share;
        membersDict.set(BigInt('0x' + address.hash.toString('hex')), BigInt(share));
    }

    if (totalShares <= 0) {
        ui.write('Total shares must be greater than 0');
        return;
    }

    // input the withdrawal fee
    const withdrawalFeeInput = await ui.input('withdrawal fee (in full TON): ');

    // Validate withdrawal fee is a valid number
    const withdrawalFee = parseFloat(withdrawalFeeInput);
    if (isNaN(withdrawalFee) || withdrawalFee < 0) {
        ui.write('Invalid withdrawal fee. Must be a non-negative number.');
        return;
    }

    const dao = provider.open(
        await DAOWithSplitter.fromInit(poolAddress, membersDict, BigInt(totalShares), BigInt(toNano(withdrawalFee))),
    );

    // confirm the deployment
    ui.write(`DAO deployed at ${dao.address}`);
    ui.write(`Pool address: ${poolAddress}`);
    ui.write(`Members: ${membersDict}`);
    ui.write(`Total shares: ${totalShares}`);
    ui.write(`Withdrawal fee: ${withdrawalFee}`);

    if (!(await ui.prompt('Confirm deployment? (y/n): '))) {
        ui.write('Deployment cancelled');
        return;
    }

    await dao.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'Gift',
    );

    await provider.waitForDeploy(dao.address);

    ui.write(`DAO deployed at ${dao.address}`);
}
// pool kQBZMclCtHLaFBh1R3BKfa5ddb1-J6EEJAITVoIfSsCp6BfQ
// 4 members
// 0QAg0sGUyZ_hryBZYWZYpuUCVHvrbglAT96mJ4Xy7Orqnh_T 1
// 0QDnSzsJIlCDs9dLD7PRtkYO-ycqZ04VjbGsNiXE9Q6uCiqC 1
// 0QBOI36-32t2rHCTnIuBh_oxLTj3o8bjMGP5MeVKEFQMp1i0 1
// 0QDh5kmc0BZikebWu1zyhoiIglN3IldqKvpkkkIh-cvKsME- 1

// deployed to EQCf_j9apB4AOqvQYa2k2lhOfSWV-Noo1z0wHu3_4AYe-Ohu
