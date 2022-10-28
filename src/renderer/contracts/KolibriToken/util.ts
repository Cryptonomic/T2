import { JSONPath } from 'jsonpath-plus';
import { BigNumber } from 'bignumber.js';
import { ConseilQueryBuilder, ConseilOperator, ConseilSortDirection, TezosConseilClient, TezosNodeReader, TezosMessageUtils } from 'conseiljs';

import * as status from '../../constants/StatusTypes';
import { Node } from '../../types/general';
import { createTokenTransaction, syncTransactionsWithState } from '../../utils/transaction';

const farms = ['KT1RB179ddATKbCi7E8ben91bo2hqRRPrNQf', 'KT1HDXjPtjv7Y7XtJxrNc5rNjnegTi2ZzNfv', 'KT18oxtA5uyhyYXyAVhTa7agJmxHCTjHpiF7'];
const farmBalanceMaps = [7264, 7262, 7263];

export async function syncTokenTransactions(tokenAddress: string, managerAddress: string, node: Node, stateTransactions: any[]) {
    let newTransactions: any[] = (
        await getTokenTransactions(tokenAddress, managerAddress, node).catch((e) => {
            console.log('-debug: Error in: getSyncAccount -> getTokenTransactions for:' + tokenAddress);
            console.error(e);
            return [];
        })
    ).filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);

    const transferPattern = /Pair"([1-9A-Za-z^OIl]{36})"\(Pair"([1-9A-Za-z^OIl]{36})"([0-9]+)\)/;
    const mintPattern = /Pair"([1-9A-Za-z^OIl]{36})"([0-9]+)/;

    newTransactions = newTransactions.map((transaction) => {
        const params = transaction.parameters.replace(/\s/g, '');
        if (transferPattern.test(params)) {
            try {
                const parts = params.match(transferPattern);

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[3]),
                    source: parts[1],
                    destination: parts[2],
                });
            } catch (e) {
                /* */
            }
        } else if (mintPattern.test(params)) {
            try {
                const parts = params.match(mintPattern);

                return createTokenTransaction({
                    ...transaction,
                    status: transaction.status !== 'applied' ? status.FAILED : status.READY,
                    amount: Number(parts[2]),
                    source: managerAddress,
                    destination: tokenAddress, // TODO: target address of mint operation parts[1]
                    entryPoint: 'mint',
                });
            } catch (e) {
                /* */
            }
        } else {
            // TODO
            console.log('kusd mismatch', transaction);
        }
    });

    return syncTransactionsWithState(newTransactions, stateTransactions);
}

export async function getActivePools(server: string, account: string): Promise<{ contract: string; map: number }[]> {
    const hasKey = await Promise.all(
        farmBalanceMaps.map(async (m) => {
            try {
                const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(account, 'address'), 'hex'));
                const mapResult = await TezosNodeReader.getValueForBigMapKey(server, m, packedKey);

                return mapResult !== undefined && JSONPath({ path: '$.args[1].int', json: mapResult }).toString() !== '0';
            } catch {
                return false;
            }
        })
    );

    const activeContracts: string[] = [];
    const activeMaps: number[] = [];
    hasKey.map((b, i) => {
        if (b) {
            activeContracts.push(farms[i]);
            activeMaps.push(farmBalanceMaps[i]);
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
                const userState = await readUserPoolRecord(server, p.map, account);
                const currentBlockLevel = head.header.level;

                const nextBlock = new BigNumber(currentBlockLevel + 1);
                const multiplier = nextBlock.minus(poolState.lastBlockUpdate);
                const outstandingReward = multiplier.times(poolState.rewardPerBlock);
                const claimedRewards = new BigNumber(poolState.paidClaimedRewards).plus(poolState.unpaidClaimedRewards);
                const totalRewards = outstandingReward.plus(claimedRewards);
                const plannedRewards = new BigNumber(poolState.rewardPerBlock).times(poolState.totalRewardBlocks);
                const totalRewardsExhausted = totalRewards.isGreaterThan(plannedRewards);
                const reward = totalRewardsExhausted ? plannedRewards.minus(claimedRewards) : outstandingReward;
                const lpMantissa = new BigNumber(10).pow(36);
                const accRewardPerShareEnd = new BigNumber(poolState.accumulatedRewardPerShare).plus(reward.times(lpMantissa).div(poolState.lpTokenBalance));
                const accumulatedRewardPerShare = accRewardPerShareEnd.minus(userState.tokenRewardsPaid);
                pendingRewards.push(accumulatedRewardPerShare.times(userState.balance).dividedBy(lpMantissa).dividedBy(new BigNumber(10).pow(18)));
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

async function getTokenTransactions(tokenAddress, managerAddress, node: Node) {
    // TODO: consider reusing the common function
    const { conseilUrl, apiKey, network } = node;

    let direct = ConseilQueryBuilder.blankQuery();
    direct = ConseilQueryBuilder.addFields(
        direct,
        'timestamp',
        'block_level',
        'source',
        'destination',
        'amount',
        'kind',
        'fee',
        'status',
        'operation_group_hash',
        'parameters'
    );
    direct = ConseilQueryBuilder.addPredicate(direct, 'kind', ConseilOperator.EQ, ['transaction'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'status', ConseilOperator.EQ, ['applied'], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'destination', ConseilOperator.EQ, [tokenAddress], false);
    direct = ConseilQueryBuilder.addPredicate(direct, 'source', ConseilOperator.EQ, [managerAddress], false);
    direct = ConseilQueryBuilder.addOrdering(direct, 'timestamp', ConseilSortDirection.DESC);
    direct = ConseilQueryBuilder.setLimit(direct, 1_000);

    let indirect = ConseilQueryBuilder.blankQuery();
    indirect = ConseilQueryBuilder.addFields(
        indirect,
        'timestamp',
        'block_level',
        'source',
        'destination',
        'amount',
        'kind',
        'fee',
        'status',
        'operation_group_hash',
        'parameters'
    );
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'kind', ConseilOperator.EQ, ['transaction'], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'status', ConseilOperator.EQ, ['applied'], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'destination', ConseilOperator.EQ, [tokenAddress], false);
    indirect = ConseilQueryBuilder.addPredicate(indirect, 'parameters', ConseilOperator.LIKE, [managerAddress], false);
    indirect = ConseilQueryBuilder.addOrdering(indirect, 'timestamp', ConseilSortDirection.DESC);
    indirect = ConseilQueryBuilder.setLimit(indirect, 1_000);

    return Promise.all([direct, indirect].map((q) => TezosConseilClient.getOperations({ url: conseilUrl, apiKey, network }, network, q)))
        .then((responses) =>
            responses.reduce((result, r) => {
                r.forEach((rr) => result.push(rr));
                return result;
            })
        )
        .then((transactions) => {
            return transactions
                .filter((o) => o !== undefined)
                .filter((obj, pos, arr) => arr.map((o) => o.operation_group_hash).indexOf(obj.operation_group_hash) === pos);
        })
        .then((transactions) => {
            return transactions.sort((a, b) => a.timestamp - b.timestamp);
        });
}

async function readPoolStorage(server, address) {
    const storageResult = await TezosNodeReader.getContractStorage(server, address);

    return {
        lastBlockUpdate: JSONPath({ path: '$.args[1].args[1].int', json: storageResult })[0],
        rewardPerBlock: JSONPath({ path: '$.args[1].args[2].int', json: storageResult })[0],
        paidClaimedRewards: JSONPath({ path: '$.args[1].args[0].args[1].int', json: storageResult })[0],
        unpaidClaimedRewards: JSONPath({ path: '$.args[1].args[0].args[2].int', json: storageResult })[0],
        totalRewardBlocks: JSONPath({ path: '$.args[1].args[3].int', json: storageResult })[0],
        accumulatedRewardPerShare: JSONPath({ path: '$.args[1].args[0].args[0].int', json: storageResult })[0],
        lpTokenBalance: JSONPath({ path: '$.args[2].int', json: storageResult })[0],
    };
}

async function readUserPoolRecord(server, mapid, address) {
    const packedKey = TezosMessageUtils.encodeBigMapKey(Buffer.from(TezosMessageUtils.writePackedData(address, 'address'), 'hex'));
    const mapResult = await TezosNodeReader.getValueForBigMapKey(server, mapid, packedKey);

    if (mapResult === undefined) {
        throw new Error(`Map ${mapid} does not contain a record for ${address}`);
    }

    return {
        balance: JSONPath({ path: '$.args[1].int', json: mapResult })[0],
        tokenRewardsPaid: JSONPath({ path: '$.args[0].int', json: mapResult })[0],
    };
}
