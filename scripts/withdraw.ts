import { NetworkProvider } from '@ton/blueprint';
import { toNano } from '@ton/core';
import { DAOWithSplitter } from '../wrappers/DAO';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    // Input the DAO contract address
    const daoAddress = await ui.inputAddress('Enter the DAO address: ');

    // Open the DAO contract
    const dao = provider.open(DAOWithSplitter.fromAddress(daoAddress));

    // Verify this is a valid DAO by checking if it has members
    const membersCount = await dao.getMembersCount();
    if (membersCount <= 0) {
        ui.write('Invalid DAO - no members found');
        return;
    }

    // Send the withdrawal message
    await dao.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        'Withdraw',
    );

    ui.write('Withdrawal request sent successfully');
}
