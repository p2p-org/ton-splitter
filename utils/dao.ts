import { NetworkProvider } from '@ton/blueprint';
import { Cell, Dictionary } from '@ton/core';

import { Address } from '@ton/core';

export interface DAOState {
    managable: Address;
    members: Dictionary<bigint, bigint>;
    denominator: bigint;
    withdrawFee: bigint;
    codeHash: Buffer;
}

export async function parseDAOState(provider: NetworkProvider, daoAddress: Address): Promise<DAOState> {
    const state = await provider.provider(daoAddress).getState();
    if (state.state.type !== 'active') {
        throw new Error('DAO is not active');
    }
    const storage = state.state.data;
    if (!storage) {
        throw new Error('DAO is not deployed');
    }
    const cellStorageSlice = Cell.fromBoc(storage)[0].beginParse();
    cellStorageSlice.loadRef();
    cellStorageSlice.loadBit();

    const managable = cellStorageSlice.loadAddress();
    const members = cellStorageSlice.loadDict(Dictionary.Keys.BigUint(257), Dictionary.Values.BigUint(257));
    const denominator = cellStorageSlice.loadUintBig(257);
    const withdrawFee = cellStorageSlice.loadUintBig(257);

    cellStorageSlice.endParse();

    return {
        managable,
        members,
        denominator,
        withdrawFee,
        codeHash: Cell.fromBoc(state.state.code!)[0].hash(),
    };
}
