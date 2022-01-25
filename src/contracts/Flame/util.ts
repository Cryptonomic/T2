import { JSONPath } from 'jsonpath-plus';
import { BigNumber } from 'bignumber.js';
import { TezosMessageUtils, TezosNodeReader } from 'conseiljs';

const farms = [
    'KT1Ee2KhwFZgbCryL9zW23ZFqbki7rC42aBv', // FLAME/FDAO LP
    // KT1QtMYTPRzt3A1ustskvofR6XZFQ3K5Ro4h FLAME LP - FDAO
    // KT1W5paDaiHLFJQuDEsnwW6x1pcMRF3LVZNc FDAO LP - FDAO
    // KT19PbGqr8BenMTpXG9booDgXr4aN9m27tYk FDAO/USDtz LP
    // KT1TV9AGA4DZ1ka5GLEHnvmun6mrdLWjQMtp FLAME/USDtz LP
    // KT1UoaLtCh2ymTrS4ceAGbfRLNUyR7wXWUMc FLAME/wUSDC LP
    // KT1VAzyeWs62JbY8NnAk2cUS3oW3CkawXzSa FLAME/kUSD LP
    // KT1G9CdDg1AMmqsTfEnAYjKZJv9d9UnMb7zG FLAME/wWETH LP
    // KT1B6qYi1NJJx3ESNckaJEo4J54LVkBZmEFq FLAME/wUSDT LP
    // KT1LFyi9aMB2TnKr9Q9vagFFCW9Xqa82mMWM FDAO/wUSDT LP
    // KT1QYxusqQAh9muntS4gwApSXm4DiSKochVm ETHtz/XTZ LP
    // KT1LiNm2QSnA61udVgbPaDuzbn2eXNgCoFNo USDtz/XTZ LP
];
const farmBalanceMaps = [];

export async function getActivePools(server: string, account: string): Promise<{ contract: string; map: number }[]> {
    const contracts = farms;
    const maps = farmBalanceMaps;
    const hasKey = await Promise.all(
        maps.map(async (m) => {
            try {
                const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
                const mapResult = await TezosNodeReader.getValueForBigMapKey(server, m, packedKey);

                return mapResult !== undefined && JSONPath({ path: '$.args[0].args[1].int', json: mapResult }).toString() !== '0';
            } catch (error) {
                console.log(`getActivePools could not read Plenty map ${m}`);
                return false;
            }
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

                const durationSinceClaim = BigNumber.min(new BigNumber(currentBlockLevel), new BigNumber(poolState.periodFinish)).minus(poolState.lastUpdateTime);
                const rewardRate = new BigNumber(poolState.rewardRate).multipliedBy('1000000000000000000');
                const rewardPerToken = new BigNumber(durationSinceClaim).multipliedBy(rewardRate).dividedBy(poolState.totalSupply).plus(new BigNumber(poolState.rewardPerTokenStored));

                let totalRewards = new BigNumber(accountState.balance).multipliedBy(rewardPerToken.minus(new BigNumber(accountState.tokenRewardsPaid)));
                totalRewards = totalRewards.dividedBy('1000000000000000000').plus(new BigNumber(accountState.rewards));
                totalRewards = totalRewards.dividedBy('1000000000000000000');

                if (!totalRewards.isNaN()) {
                    pendingRewards.push(totalRewards);
                }
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
