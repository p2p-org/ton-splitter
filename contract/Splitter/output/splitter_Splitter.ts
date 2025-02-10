import { Cell, Slice, Address, Builder, beginCell, ComputeError, TupleItem, TupleReader, Dictionary, contractAddress, ContractProvider, Sender, Contract, ContractABI, TupleBuilder, DictionaryValue } from 'ton-core';
import { ContractSystem, ContractExecutor } from 'ton-emulator';

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    let sc_0 = slice;
    let _code = sc_0.loadRef();
    let _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function loadTupleStateInit(source: TupleReader) {
    let _code = source.readCell();
    let _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

function storeTupleStateInit(source: StateInit) {
    let builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}
export type Context = {
    $$type: 'Context';
    bounced: boolean;
    sender: Address;
    value: bigint;
    raw: Cell;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounced);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw);
    };
}

export function loadContext(slice: Slice) {
    let sc_0 = slice;
    let _bounced = sc_0.loadBit();
    let _sender = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _raw = sc_0.loadRef();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function loadTupleContext(source: TupleReader) {
    let _bounced = source.readBoolean();
    let _sender = source.readAddress();
    let _value = source.readBigNumber();
    let _raw = source.readCell();
    return { $$type: 'Context' as const, bounced: _bounced, sender: _sender, value: _value, raw: _raw };
}

function storeTupleContext(source: Context) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounced);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw);
    return builder.build();
}

function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}
export type SendParameters = {
    $$type: 'SendParameters';
    bounce: boolean;
    to: Address;
    value: bigint;
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeBit(src.bounce);
        b_0.storeAddress(src.to);
        b_0.storeInt(src.value, 257);
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
    };
}

export function loadSendParameters(slice: Slice) {
    let sc_0 = slice;
    let _bounce = sc_0.loadBit();
    let _to = sc_0.loadAddress();
    let _value = sc_0.loadIntBig(257);
    let _mode = sc_0.loadIntBig(257);
    let _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function loadTupleSendParameters(source: TupleReader) {
    let _bounce = source.readBoolean();
    let _to = source.readAddress();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _body = source.readCellOpt();
    let _code = source.readCellOpt();
    let _data = source.readCellOpt();
    return { $$type: 'SendParameters' as const, bounce: _bounce, to: _to, value: _value, mode: _mode, body: _body, code: _code, data: _data };
}

function storeTupleSendParameters(source: SendParameters) {
    let builder = new TupleBuilder();
    builder.writeBoolean(source.bounce);
    builder.writeAddress(source.to);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}
export type Deploy = {
    $$type: 'Deploy';
    queryId: bigint;
}

export function storeDeploy(src: Deploy) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2490013878, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeploy(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2490013878) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function loadTupleDeploy(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'Deploy' as const, queryId: _queryId };
}

function storeTupleDeploy(source: Deploy) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeploy(): DictionaryValue<Deploy> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeploy(src)).endCell());
        },
        parse: (src) => {
            return loadDeploy(src.loadRef().beginParse());
        }
    }
}
export type DeployOk = {
    $$type: 'DeployOk';
    queryId: bigint;
}

export function storeDeployOk(src: DeployOk) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2952335191, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadDeployOk(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2952335191) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function loadTupleDeployOk(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'DeployOk' as const, queryId: _queryId };
}

function storeTupleDeployOk(source: DeployOk) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserDeployOk(): DictionaryValue<DeployOk> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDeployOk(src)).endCell());
        },
        parse: (src) => {
            return loadDeployOk(src.loadRef().beginParse());
        }
    }
}
export type ChangeOwner = {
    $$type: 'ChangeOwner';
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(256331011, 32);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 256331011) { throw Error('Invalid prefix'); }
    let _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, newOwner: _newOwner };
}

function loadTupleChangeOwner(source: TupleReader) {
    let _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, newOwner: _newOwner };
}

function storeTupleChangeOwner(source: ChangeOwner) {
    let builder = new TupleBuilder();
    builder.writeAddress(source.newOwner);
    return builder.build();
}

function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}
export type DictLookupResult = {
    $$type: 'DictLookupResult';
    key: bigint | null;
    value: Cell | null;
    found: boolean;
}

export function storeDictLookupResult(src: DictLookupResult) {
    return (builder: Builder) => {
        let b_0 = builder;
        if (src.key !== null && src.key !== undefined) { b_0.storeBit(true).storeInt(src.key, 257); } else { b_0.storeBit(false); }
        if (src.value !== null && src.value !== undefined) { b_0.storeBit(true).storeRef(src.value); } else { b_0.storeBit(false); }
        b_0.storeBit(src.found);
    };
}

export function loadDictLookupResult(slice: Slice) {
    let sc_0 = slice;
    let _key = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    let _value = sc_0.loadBit() ? sc_0.loadRef() : null;
    let _found = sc_0.loadBit();
    return { $$type: 'DictLookupResult' as const, key: _key, value: _value, found: _found };
}

function loadTupleDictLookupResult(source: TupleReader) {
    let _key = source.readBigNumberOpt();
    let _value = source.readCellOpt();
    let _found = source.readBoolean();
    return { $$type: 'DictLookupResult' as const, key: _key, value: _value, found: _found };
}

function storeTupleDictLookupResult(source: DictLookupResult) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.key);
    builder.writeSlice(source.value);
    builder.writeBoolean(source.found);
    return builder.build();
}

function dictValueParserDictLookupResult(): DictionaryValue<DictLookupResult> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeDictLookupResult(src)).endCell());
        },
        parse: (src) => {
            return loadDictLookupResult(src.loadRef().beginParse());
        }
    }
}
export type ParsedAddress = {
    $$type: 'ParsedAddress';
    wc: bigint;
    hash: bigint;
}

export function storeParsedAddress(src: ParsedAddress) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeInt(src.wc, 257);
        b_0.storeInt(src.hash, 257);
    };
}

export function loadParsedAddress(slice: Slice) {
    let sc_0 = slice;
    let _wc = sc_0.loadIntBig(257);
    let _hash = sc_0.loadIntBig(257);
    return { $$type: 'ParsedAddress' as const, wc: _wc, hash: _hash };
}

function loadTupleParsedAddress(source: TupleReader) {
    let _wc = source.readBigNumber();
    let _hash = source.readBigNumber();
    return { $$type: 'ParsedAddress' as const, wc: _wc, hash: _hash };
}

function storeTupleParsedAddress(source: ParsedAddress) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.wc);
    builder.writeNumber(source.hash);
    return builder.build();
}

function dictValueParserParsedAddress(): DictionaryValue<ParsedAddress> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeParsedAddress(src)).endCell());
        },
        parse: (src) => {
            return loadParsedAddress(src.loadRef().beginParse());
        }
    }
}
export type PoolCommandMessage = {
    $$type: 'PoolCommandMessage';
    queryId: bigint;
    value: bigint;
    mode: bigint;
    bounce: boolean;
    body: Cell;
}

export function storePoolCommandMessage(src: PoolCommandMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(2136499104, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.value);
        b_0.storeUint(src.mode, 8);
        b_0.storeBit(src.bounce);
        b_0.storeRef(src.body);
    };
}

export function loadPoolCommandMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 2136499104) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _value = sc_0.loadCoins();
    let _mode = sc_0.loadUintBig(8);
    let _bounce = sc_0.loadBit();
    let _body = sc_0.loadRef();
    return { $$type: 'PoolCommandMessage' as const, queryId: _queryId, value: _value, mode: _mode, bounce: _bounce, body: _body };
}

function loadTuplePoolCommandMessage(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _value = source.readBigNumber();
    let _mode = source.readBigNumber();
    let _bounce = source.readBoolean();
    let _body = source.readCell();
    return { $$type: 'PoolCommandMessage' as const, queryId: _queryId, value: _value, mode: _mode, bounce: _bounce, body: _body };
}

function storeTuplePoolCommandMessage(source: PoolCommandMessage) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.value);
    builder.writeNumber(source.mode);
    builder.writeBoolean(source.bounce);
    builder.writeCell(source.body);
    return builder.build();
}

function dictValueParserPoolCommandMessage(): DictionaryValue<PoolCommandMessage> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storePoolCommandMessage(src)).endCell());
        },
        parse: (src) => {
            return loadPoolCommandMessage(src.loadRef().beginParse());
        }
    }
}
export type MembersChangeInfo = {
    $$type: 'MembersChangeInfo';
    members: Dictionary<bigint, bigint>;
    denominator: bigint;
}

export function storeMembersChangeInfo(src: MembersChangeInfo) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeDict(src.members, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_0.storeInt(src.denominator, 257);
    };
}

export function loadMembersChangeInfo(slice: Slice) {
    let sc_0 = slice;
    let _members = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_0);
    let _denominator = sc_0.loadIntBig(257);
    return { $$type: 'MembersChangeInfo' as const, members: _members, denominator: _denominator };
}

function loadTupleMembersChangeInfo(source: TupleReader) {
    let _members = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    let _denominator = source.readBigNumber();
    return { $$type: 'MembersChangeInfo' as const, members: _members, denominator: _denominator };
}

function storeTupleMembersChangeInfo(source: MembersChangeInfo) {
    let builder = new TupleBuilder();
    builder.writeCell(source.members.size > 0 ? beginCell().storeDictDirect(source.members, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.denominator);
    return builder.build();
}

function dictValueParserMembersChangeInfo(): DictionaryValue<MembersChangeInfo> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeMembersChangeInfo(src)).endCell());
        },
        parse: (src) => {
            return loadMembersChangeInfo(src.loadRef().beginParse());
        }
    }
}
export type MembersChangeMessage = {
    $$type: 'MembersChangeMessage';
    queryId: bigint;
    gasLimit: bigint;
    members: Dictionary<bigint, bigint>;
    denominator: bigint;
}

export function storeMembersChangeMessage(src: MembersChangeMessage) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1687769704, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.gasLimit);
        b_0.storeDict(src.members, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257));
        b_0.storeInt(src.denominator, 257);
    };
}

export function loadMembersChangeMessage(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1687769704) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _gasLimit = sc_0.loadCoins();
    let _members = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), sc_0);
    let _denominator = sc_0.loadIntBig(257);
    return { $$type: 'MembersChangeMessage' as const, queryId: _queryId, gasLimit: _gasLimit, members: _members, denominator: _denominator };
}

function loadTupleMembersChangeMessage(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _gasLimit = source.readBigNumber();
    let _members = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
    let _denominator = source.readBigNumber();
    return { $$type: 'MembersChangeMessage' as const, queryId: _queryId, gasLimit: _gasLimit, members: _members, denominator: _denominator };
}

function storeTupleMembersChangeMessage(source: MembersChangeMessage) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.gasLimit);
    builder.writeCell(source.members.size > 0 ? beginCell().storeDictDirect(source.members, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(source.denominator);
    return builder.build();
}

function dictValueParserMembersChangeMessage(): DictionaryValue<MembersChangeMessage> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeMembersChangeMessage(src)).endCell());
        },
        parse: (src) => {
            return loadMembersChangeMessage(src.loadRef().beginParse());
        }
    }
}
export type WithdrawStake = {
    $$type: 'WithdrawStake';
    queryId: bigint;
    gasLimit: bigint;
    stake: bigint;
}

export function storeWithdrawStake(src: WithdrawStake) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(3665837821, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeCoins(src.gasLimit);
        b_0.storeCoins(src.stake);
    };
}

export function loadWithdrawStake(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 3665837821) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    let _gasLimit = sc_0.loadCoins();
    let _stake = sc_0.loadCoins();
    return { $$type: 'WithdrawStake' as const, queryId: _queryId, gasLimit: _gasLimit, stake: _stake };
}

function loadTupleWithdrawStake(source: TupleReader) {
    let _queryId = source.readBigNumber();
    let _gasLimit = source.readBigNumber();
    let _stake = source.readBigNumber();
    return { $$type: 'WithdrawStake' as const, queryId: _queryId, gasLimit: _gasLimit, stake: _stake };
}

function storeTupleWithdrawStake(source: WithdrawStake) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeNumber(source.gasLimit);
    builder.writeNumber(source.stake);
    return builder.build();
}

function dictValueParserWithdrawStake(): DictionaryValue<WithdrawStake> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeWithdrawStake(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawStake(src.loadRef().beginParse());
        }
    }
}
export type WithdrawStakeResponse = {
    $$type: 'WithdrawStakeResponse';
    queryId: bigint;
}

export function storeWithdrawStakeResponse(src: WithdrawStakeResponse) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(601104865, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadWithdrawStakeResponse(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 601104865) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'WithdrawStakeResponse' as const, queryId: _queryId };
}

function loadTupleWithdrawStakeResponse(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'WithdrawStakeResponse' as const, queryId: _queryId };
}

function storeTupleWithdrawStakeResponse(source: WithdrawStakeResponse) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserWithdrawStakeResponse(): DictionaryValue<WithdrawStakeResponse> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeWithdrawStakeResponse(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawStakeResponse(src.loadRef().beginParse());
        }
    }
}
export type WithdrawStakeDelayed = {
    $$type: 'WithdrawStakeDelayed';
    queryId: bigint;
}

export function storeWithdrawStakeDelayed(src: WithdrawStakeDelayed) {
    return (builder: Builder) => {
        let b_0 = builder;
        b_0.storeUint(1958425639, 32);
        b_0.storeUint(src.queryId, 64);
    };
}

export function loadWithdrawStakeDelayed(slice: Slice) {
    let sc_0 = slice;
    if (sc_0.loadUint(32) !== 1958425639) { throw Error('Invalid prefix'); }
    let _queryId = sc_0.loadUintBig(64);
    return { $$type: 'WithdrawStakeDelayed' as const, queryId: _queryId };
}

function loadTupleWithdrawStakeDelayed(source: TupleReader) {
    let _queryId = source.readBigNumber();
    return { $$type: 'WithdrawStakeDelayed' as const, queryId: _queryId };
}

function storeTupleWithdrawStakeDelayed(source: WithdrawStakeDelayed) {
    let builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    return builder.build();
}

function dictValueParserWithdrawStakeDelayed(): DictionaryValue<WithdrawStakeDelayed> {
    return {
        serialize: (src, buidler) => {
            buidler.storeRef(beginCell().store(storeWithdrawStakeDelayed(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawStakeDelayed(src.loadRef().beginParse());
        }
    }
}
async function Splitter_init(managable: Address, admin: Address, members: Dictionary<bigint, bigint>, denominator: bigint, withdrawFee: bigint) {
    const __init = 'te6ccgEBCAEAbgABFP8A9KQT9LzyyAsBAgFiAgMCAs0EBQAJoUrd4A0AAdQBFWm0GyMwGEDTbPMmBgFkUGXPFhP0AAHPFoEBAc8AAsiBAQHPACFus46OfwHKAAEgbvLQgG8i2zyUcDLKAOLJAcwHABAC9ACBAQHPAA==';
    const __code = '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';
    const __system = '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';
    let systemCell = Cell.fromBase64(__system);
    let builder = new TupleBuilder();
    builder.writeCell(systemCell);
    builder.writeAddress(managable);
    builder.writeAddress(admin);
    builder.writeCell(members.size > 0 ? beginCell().storeDictDirect(members, Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257)).endCell() : null);
    builder.writeNumber(denominator);
    builder.writeNumber(withdrawFee);
    let __stack = builder.build();
    let codeCell = Cell.fromBoc(Buffer.from(__code, 'base64'))[0];
    let initCell = Cell.fromBoc(Buffer.from(__init, 'base64'))[0];
    let system = await ContractSystem.create();
    let executor = await ContractExecutor.create({ code: initCell, data: new Cell() }, system);
    let res = await executor.get('init', __stack);
    if (!res.success) { throw Error(res.error); }
    if (res.exitCode !== 0 && res.exitCode !== 1) {
        if (Splitter_errors[res.exitCode]) {
            throw new ComputeError(Splitter_errors[res.exitCode].message, res.exitCode, { logs: res.vmLogs });
        } else {
            throw new ComputeError('Exit code: ' + res.exitCode, res.exitCode, { logs: res.vmLogs });
        }
    }
    
    let data = res.stack.readCell();
    return { code: codeCell, data };
}

const Splitter_errors: { [key: number]: { message: string } } = {
    2: { message: `Stack undeflow` },
    3: { message: `Stack overflow` },
    4: { message: `Integer overflow` },
    5: { message: `Integer out of expected range` },
    6: { message: `Invalid opcode` },
    7: { message: `Type check error` },
    8: { message: `Cell overflow` },
    9: { message: `Cell underflow` },
    10: { message: `Dictionary error` },
    13: { message: `Out of gas error` },
    32: { message: `Method ID not found` },
    34: { message: `Action is invalid or not supported` },
    37: { message: `Not enough TON` },
    38: { message: `Not enough extra-currencies` },
    128: { message: `Null reference exception` },
    129: { message: `Invalid serialization prefix` },
    130: { message: `Invalid incoming message` },
    131: { message: `Constraints error` },
    132: { message: `Access denied` },
    133: { message: `Contract stopped` },
    134: { message: `Invalid argument` },
    135: { message: `Code of a contract was not found` },
    136: { message: `Invalid address` },
    14720: { message: `Not enough balance to withdraw` },
    16466: { message: `You are not a member or admin` },
    17253: { message: `You are not a member` },
    25422: { message: `Admin only` },
}

export class Splitter implements Contract {
    
    static async init(managable: Address, admin: Address, members: Dictionary<bigint, bigint>, denominator: bigint, withdrawFee: bigint) {
        return await Splitter_init(managable,admin,members,denominator,withdrawFee);
    }
    
    static async fromInit(managable: Address, admin: Address, members: Dictionary<bigint, bigint>, denominator: bigint, withdrawFee: bigint) {
        const init = await Splitter_init(managable,admin,members,denominator,withdrawFee);
        const address = contractAddress(0, init);
        return new Splitter(address, init);
    }
    
    static fromAddress(address: Address) {
        return new Splitter(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        errors: Splitter_errors
    };
    
    private constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: PoolCommandMessage | MembersChangeMessage | 'Topup DAO' | 'Terminated' | 'Withdraw' | 'Gift' | WithdrawStakeResponse | WithdrawStakeDelayed) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'PoolCommandMessage') {
            body = beginCell().store(storePoolCommandMessage(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'MembersChangeMessage') {
            body = beginCell().store(storeMembersChangeMessage(message)).endCell();
        }
        if (message === 'Topup DAO') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Terminated') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Withdraw') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message === 'Gift') {
            body = beginCell().storeUint(0, 32).storeStringTail(message).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawStakeResponse') {
            body = beginCell().store(storeWithdrawStakeResponse(message)).endCell();
        }
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'WithdrawStakeDelayed') {
            body = beginCell().store(storeWithdrawStakeDelayed(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getMemberShare(provider: ContractProvider, addr: Address) {
        let builder = new TupleBuilder();
        builder.writeAddress(addr);
        let source = (await provider.get('memberShare', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMembersCount(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('membersCount', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMinimumVotes(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('minimumVotes', builder.build())).stack;
        let result = source.readBigNumber();
        return result;
    }
    
    async getMembers(provider: ContractProvider) {
        let builder = new TupleBuilder();
        let source = (await provider.get('members', builder.build())).stack;
        let result = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.BigInt(257), source.readCellOpt());
        return result;
    }
    
}