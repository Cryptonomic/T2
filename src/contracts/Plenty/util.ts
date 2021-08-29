import { JSONPath } from 'jsonpath-plus';
import { BigNumber } from 'bignumber.js';
import { TezosMessageUtils, TezosNodeReader } from 'conseiljs';

const farms = [
    'KT1DjDZio7k2GJwCJCXwK82ing3n51AE55DW',
    'KT1JQAZqShNMakSNXc2cgTzdAWZFemGcU6n1',
    'KT1KJhxkCpZNwAFQURDoJ79hGqQgSC9UaWpG',
    'KT1Kp3KVT4nHFmSuL8bvETkgQzseUYP3LDBy',
    'KT1M82a7arHVwcwaswnNUUuCnQ45xjjGKNd1',
    'KT1UP9XHQigWMqNXYp9YXaCS1hV9jJkCF4h4',
    'KT1UqnQ6b1EwQgYiKss4mDL7aktAHnkdctTQ',
    'KT1VCrmywPNf8ZHH95HKHvYA4bBQJPa8g2sr',
];
const farmBalanceMaps = [4488, 4503, 10768, 11019, 11057, 11823, 11819, 11821];
const pools = [
    'KT1QqjR4Fj9YegB37PQEqXUPHmFbhz6VJtwE',
    'KT19asUVzBNidHgTHp8MP31YSphooMb3piWR',
    'KT1Ga15wxGR5oWK1vBG2GXbjYM6WqPgpfRSP',
    'KT1MBqc3GHpApBXaBZyvY63LF6eoFyTWtySn',
    'KT1KyxPitU1xNbTriondmAFtPEcFhjSLV1hz',
    'KT1XherecVvrE6X4PV5RTwdEKNzA294ZE9T9',
    'KT1GotpjdBaxt2GiMFcQExLEk9GTfYo4UoTa',
    'KT18oB3x8SLxMJq2o9hKNupbZZ5ZMsgr2aho',
];
const poolBalanceMaps = [4494, 4491, 4496, 4490, 4492, 4493, 7985, 7988];

export async function getSimpleStorage(server: string, address: string): Promise<{ mapid: number; supply: number; administrator: string; paused: boolean }> {
    const storageResult = await TezosNodeReader.getContractStorage(server, address);

    const administratorPath = '$.args[0].args[0].args[0].string';
    const ledgerPath = '$.args[0].args[0].args[1].int';
    const pausePath = '$.args[1].args[0].prim';
    const supplyPath = '$.args[3].int';

    return {
        mapid: Number(JSONPath({ path: ledgerPath, json: storageResult })[0]),
        supply: new BigNumber(JSONPath({ path: supplyPath, json: storageResult })[0]).toNumber(),
        administrator: JSONPath({ path: administratorPath, json: storageResult })[0],
        paused: JSONPath({ path: pausePath, json: storageResult })[0].toString().toLowerCase().startsWith('t'),
    };
}

export async function getAccountBalance(server: string, mapid: number, account: string): Promise<number> {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) {
        throw new Error(`Map ${mapid} does not contain a record for ${account}`);
    }

    const jsonresult = JSONPath({ path: '$.args[1].int', json: mapResult });
    return Number(jsonresult[0]);
}

export async function getAccountAllowance(server: string, mapid: number, account: string, source: string) {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(source, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) {
        throw new Error(`Map ${mapid} does not contain a record for ${source}/${account}`);
    }

    const allowances = new Map<string, number>();
    JSONPath({ path: '$.args[0][*].args', json: mapResult }).forEach((v) => (allowances[v[0].string] = Number(v[1].int)));

    return allowances[account];
}

export async function getActivePools(server: string, account: string): Promise<{ contract: string; map: number }[]> {
    const contracts = farms.concat(pools);
    const maps = farmBalanceMaps.concat(poolBalanceMaps);
    const hasKey = await Promise.all(
        maps.map(async (m) => {
            const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
            const mapResult = await TezosNodeReader.getValueForBigMapKey(server, m, packedKey);

            return mapResult !== undefined && JSONPath({ path: '$.args[0].args[1].int', json: mapResult }).toString() !== '0';
        })
    );

    const activeContracts: string[] = [];
    const activeMaps: number[] = [];
    hasKey.map((b, i) => {
        if (b) {
            activeContracts.push(contracts[i]);
            activeMaps.push(maps[i]);
        }
    });

    return activeContracts.map((c, i) => {
        return { contract: c, map: activeMaps[i] };
    });
}

export async function calcPendingRewards(server: string, account: string): Promise<string> {
    const accountPools = await getActivePools(server, account);
    const pendingRewards: BigNumber[] = [];

    await Promise.all(
        accountPools.map(async (p) => {
            try {
                const head = await TezosNodeReader.getBlockHead(server);
                const poolState = await readPoolStorage(server, p.contract);
                const accountState = await readUserPoolRecord(server, p.map, account);
                const currentBlockLevel = head.header.level;

                const durationSinceClaim = BigNumber.min(new BigNumber(currentBlockLevel), new BigNumber(poolState.periodFinish)).minus(
                    poolState.lastUpdateTime
                );
                const rewardRate = new BigNumber(poolState.rewardRate).multipliedBy('1000000000000000000');
                const rewardPerToken = new BigNumber(durationSinceClaim)
                    .multipliedBy(rewardRate)
                    .dividedBy(poolState.totalSupply)
                    .plus(new BigNumber(poolState.rewardPerTokenStored));

                let totalRewards = new BigNumber(accountState.balance).multipliedBy(rewardPerToken.minus(new BigNumber(accountState.tokenRewardsPaid)));
                totalRewards = totalRewards.dividedBy('1000000000000000000').plus(new BigNumber(accountState.rewards));
                totalRewards = totalRewards.dividedBy('1000000000000000000');

                pendingRewards.push(totalRewards);
            } catch (error) {
                console.log(error);
            }
        })
    );

    return pendingRewards
        .reduce((a, c) => {
            a = a.plus(c);
            return a;
        })
        .toFixed(6);
}

async function readPoolStorage(server, address) {
    const storageResult = await TezosNodeReader.getContractStorage(server, address);

    return {
        periodFinish: new BigNumber(JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0]).toString(),
        rewardRate: new BigNumber(JSONPath({ path: '$.args[1].args[1].int', json: storageResult })[0]).toString(),
        lastUpdateTime: new BigNumber(JSONPath({ path: '$.args[0].args[2].int', json: storageResult })[0]).toString(),
        totalSupply: new BigNumber(JSONPath({ path: '$.args[3].int', json: storageResult })[0]).toString(),
        rewardPerTokenStored: new BigNumber(JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0]).toString(),
    };
}

async function readUserPoolRecord(server, mapid, address) {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(address, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) {
        throw new Error(`Map ${mapid} does not contain a record for ${address}`);
    }

    return {
        balance: JSONPath({ path: '$.args[0].args[1].int', json: mapResult }),
        rewards: JSONPath({ path: '$.args[2].int', json: mapResult }),
        tokenRewardsPaid: JSONPath({ path: '$.args[3].int', json: mapResult }),
    };
}
