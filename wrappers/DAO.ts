import { beginCell } from '@ton/core';

import { DictionaryValue } from '@ton/core';
import { loadProposedMessage, ProposedMessage, storeProposedMessage } from './DAOProposal';

export * from '../build/DAO/tact_DAOWithSplitter';

// copy pasted from DAOWithSplitter.ts
export function dictValueParserProposedMessage(): DictionaryValue<ProposedMessage> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeProposedMessage(src)).endCell());
        },
        parse: (src) => {
            return loadProposedMessage(src.loadRef().beginParse());
        },
    };
}

export const DAO_CODE_HASH = 'cefd7fe3eb69c3f862e18b41be60f700a1a54cfd97a9ca6d07a4c5139caa591a';
