import { NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';

export async function validatePool(provider: NetworkProvider, poolAddress: Address, daoAddress: Address) {
    if (!provider.isContractDeployed(poolAddress)) {
        throw new Error('Pool contract is not deployed');
    }
    const ownerResult = await provider.provider(poolAddress).get('get_owner', []);
    const poolOwner = ownerResult.stack.readAddress();
    console.log('poolOwner', poolOwner);
    if (!poolOwner.equals(daoAddress)) {
        throw new Error('Pool is not owned by the DAO');
    }

    return true;
}
