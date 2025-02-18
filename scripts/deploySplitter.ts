import { toNano } from '@ton/core';
import { Splitter } from '../wrappers/Splitter';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    throw new Error('Not implemented');
    // const splitter = provider.open(await Splitter.fromInit());

    // await splitter.send(
    //     provider.sender(),
    //     {
    //         value: toNano('0.05'),
    //     },
    //     {
    //         $$type: 'Deploy',
    //         queryId: 0n,
    //     }
    // );

    // await provider.waitForDeploy(splitter.address);

    // run methods on `splitter`
}
