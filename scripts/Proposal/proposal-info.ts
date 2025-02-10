import { NetworkProvider, sleep, UIProvider } from '@ton/blueprint';
import { loadProposal$Data, Proposal } from '../../wrappers/DAOProposal';
import { Cell } from '@ton/core';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const proposalAddress = await ui.inputAddress('Enter the proposal address: ');

    if (!provider.isContractDeployed(proposalAddress)) {
        ui.write('Proposal contract is not deployed');
        return;
    }

    const proposalState = await provider.provider(proposalAddress).getState();

    if (proposalState.state.type !== 'active') {
        ui.write('Proposal is not active');
        return;
    }

    const data = proposalState.state.data;

    if (!data) {
        ui.write('Proposal data is not found');
        return;
    }

    const dataSlice = Cell.fromBoc(data)[0].beginParse();

    dataSlice.loadRef();
    dataSlice.skip(1);

    const state = loadProposal$Data(dataSlice);

    console.log(state);
}
