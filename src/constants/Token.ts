import { ArtToken, VaultToken, Token, TokenKind } from '../types/general';
import { TRANSACTIONS, DETAILS, COLLECTION } from './TabConstants';

import tzbtcIcon from '../../resources/contracts/tzbtc-icon.png';
import usdtzIcon from '../../resources/contracts/usdtz-icon.png';
import ethtzIcon from '../../resources/contracts/ethtz-icon.png';
import wxtzIcon from '../../resources/contracts/wXTZ-token-FullColor.png';
import uteIcon from '../../resources/contracts/ute-aspen-icon.png';
import kusdIcon from '../../resources/contracts/kusd-icon.png';
import hicetnuncIcon from '../../resources/contracts/hicetnunc-icon.png';
import blndIcon from '../../resources/contracts/blnd-icon.png';
import stkrIcon from '../../resources/contracts/stkr-icon.png';
import hdaoIcon from '../../resources/contracts/hdao-icon.png';

export const knownTokenContracts: (Token | VaultToken | ArtToken)[] = [
    {
        network: 'mainnet',
        address: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
        displayName: 'USDtez',
        symbol: 'USDtz',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.usdtz,
        icon: usdtzIcon,
        scale: 6,
        precision: 6,
        round: 2,
        helpLink: 'https://usdtz.com',
    },
    {
        network: 'mainnet',
        address: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
        displayName: 'ETHtez',
        symbol: 'ETHtz',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.ethtz,
        icon: ethtzIcon,
        scale: 18,
        precision: 18,
        round: 6,
        helpLink: 'https://ethtz.io',
    },
    {
        network: 'mainnet',
        address: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        displayName: 'Kolibri',
        symbol: 'kUSD',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.kusd,
        icon: kusdIcon,
        scale: 18,
        precision: 18,
        round: 2,
        mapid: 380,
    },
    {
        network: 'mainnet',
        address: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
        displayName: 'hic et nunc',
        symbol: 'OBJKT',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        icon: hicetnuncIcon,
        scale: 0,
        precision: 0,
        round: 0,
        helpLink: 'https://www.hicetnunc.xyz/',
        marketAddress: 'KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9',
    },
    {
        network: 'mainnet',
        address: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH',
        displayName: 'Wrapped Tezos',
        symbol: 'wXTZ',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.wxtz,
        icon: wxtzIcon,
        scale: 6,
        precision: 6,
        round: 2,
        helpLink: 'https://stakerdao.gitbook.io/stakerdao-faq-and-docs/wrapped-tezos-wxtz-faq-and-docs',
        vaultCoreAddress: 'KT1V4Vp7zhynCNuaBjWMpNU535Xm2sgqkz6M',
        vaultRegistryMapId: 260,
        vaultList: [],
    },
    {
        network: 'mainnet',
        address: 'KT1MEouXPpCx9eFJYnxfAWpFA7NxhW3rDgUN',
        displayName: 'Blend',
        symbol: 'BLND',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.blnd,
        icon: blndIcon,
        scale: 18,
        precision: 18,
        round: 2,
        mapid: 368,
        helpLink: 'https://docs.stakerdao.com/blend-blnd-faq-and-docs',
    },
    {
        network: 'mainnet',
        address: 'KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea',
        displayName: 'Staker Governance Token',
        symbol: 'STKR',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.stkr,
        icon: stkrIcon,
        scale: 18,
        precision: 18,
        round: 2,
        mapid: 527,
        helpLink: 'https://docs.stakerdao.com/',
    },
    {
        network: 'mainnet',
        address: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        displayName: 'tzBTC',
        symbol: 'tzBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzbtc,
        icon: tzbtcIcon,
        scale: 8,
        precision: 8,
        round: 8,
    },
    {
        network: 'mainnet',
        address: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
        displayName: 'hDAO',
        symbol: 'hDAO',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7, // TODO: TokenKind.tzip12
        icon: hdaoIcon,
        scale: 6,
        precision: 6,
        round: 2,
        // helpLink: 'https://'
    },
    {
        network: 'mainnet',
        address: 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf',
        displayName: 'Stably USD',
        symbol: 'USDS',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7, // TODO: TokenKind.tzip12
        icon: hdaoIcon,
        scale: 6,
        precision: 6,
        round: 2,
        // helpLink: 'https://'
    },
    {
        network: 'mainnet',
        address: 'KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA',
        displayName: 'QLkUSD',
        symbol: 'QLkUSD',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.kusd,
        icon: kusdIcon,
        scale: 36,
        precision: 36,
        round: 2,
        mapid: 1600,
        // helpLink: 'https://'
    },
    {
        network: 'mainnet',
        address: 'KT1PzkxU8UC4Py85VxbbrHyiJ57Bknjom3r2',
        displayName: 'UTE Token by Aspen Collective Trust',
        symbol: 'UTE',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: uteIcon,
        scale: 6,
        precision: 6,
        round: 2,
    },
    {
        network: 'mainnet',
        address: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
        displayName: 'WRAP Governance Token',
        symbol: 'WRAP',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7, // TODO: TokenKind.tzip12
        // icon: uteIcon,
        scale: 8,
        precision: 8,
        round: 2,
        // helpLink: 'https://'
    },
    {
        network: 'mainnet',
        address: 'KT1Nbc9cmx19qFrYYFpkiDoojVYL8UZJYVcj',
        displayName: 'Guts Gaming token',
        symbol: 'GUTS',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7, // TODO: TokenKind.tzip12
        // icon: uteIcon,
        scale: 0,
        precision: 0,
        round: 0,
        // helpLink: 'https://'
    },
];

export const knownTokenDescription = {
    wXTZ: 'is a fully collateralized representation of XTZ conforming to the FA1.2 token standard',
    tzBTC: 'is a Tezos token which is fully collateralized with Bitcoin, issued by the Bitcoin Association Switzerland',
    kUSD: 'is a Tezos based stablecoin built on Collateralized Debt Positions (CDPs)',
    USDtz: 'is a stable coin pegged to the value of the United States Dollar',
    ETHtz: '',
    STKR: 'is the governance token for StakerDAO, is built on the FA 1.2 token standard on Tezos',
};

export const knownContractNames = {
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: 'tzBTC Token',
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: 'USDtz Token',
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: 'ETHtz Token',
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: 'wXTZ Token',
    KT1V4Vp7zhynCNuaBjWMpNU535Xm2sgqkz6M: 'wXTZ Manager',
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: 'Kolibri Token',
    KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea: 'STKR Token',
    KT1MEouXPpCx9eFJYnxfAWpFA7NxhW3rDgUN: 'BLND Token',
    KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf: 'USDS Token',
    KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA: 'QLkUSD Token',
    KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd: 'WRAP Token',
    KT1Nbc9cmx19qFrYYFpkiDoojVYL8UZJYVcj: 'GUTS Token',

    KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU: 'Dexter ETHtz Pool',
    KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9: 'Dexter USDtz Pool',
    KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N: 'Dexter tzBTC Pool',
    KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo: 'Dexter wXTZ Pool',
    KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6: 'Dexter kUSD Pool',

    KT1WxgZ1ZSfMgmsSDDcUn8Xn577HwnQ7e1Lb: 'QuipuSwap USDtz Pool',
    KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6: 'QuipuSwap kUSD Pool',
    KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT: 'QuipuSwap wXTZ Pool',
    KT1WBLrLE2vG8SedBqiSJFm4VVAZZBytJYHc: 'QuipuSwap tzBTC Pool',
    KT1Evsp2yA19Whm24khvFPcwimK6UaAJu8Zo: 'QuipuSwap ETHtz Pool',
    KT1BMEEPX7MWzwwadW3NCSZe9XGmFJ7rs7Dr: 'QuipuSwap STKR Pool',
    KT1QxLqukyfohPV5kPkw97Rs6cw1DDDvYgbB: 'QuipuSwap hDAO Pool',
    KT1KFszq8UFCcWxnXuhZPUyHT9FK3gjmSKm6: 'QuipuSwap USDS Pool',
    KT1WtFb1mTsFRd1n1nAYMdrE2Ud9XREz5hjK: 'QuipuSwap QLkUSD Pool',
    KT1FG63hhFtMEEEtmBSX2vuFmP87t9E7Ab4t: 'QuipuSwap WRAP Pool',
    KT1WYQj3HEt3sxdsV4dMLA8RKzUnYAzXgguS: 'QuipuSwap GUTS Pool',

    KT1Lw8hCoaBrHeTeMXbqHPG4sS4K1xn7yKcD: 'QuipuSwap FA1.2 Pool Factory',
    KT1GDtv3sqhWeSsXLWgcGsmoH5nRRGJd8xVc: 'Quipuswap FA2 Pool Factory',

    KT1CpeSQKdkhWi4pinYcseCFKmDhs5M74BkU: 'tzcolors Auction House',
    KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s: 'tzcolors NFT',

    KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9: 'hic et nunc Art House',
    KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton: 'hic et nunc NFT',
    KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW: 'hic et nunc DAO',

    KT1H28iie4mW9LmmJeYLjH6zkC8wwSmfHf5P: 'TzButton Round 2',
};

export const knownMarketMetadata = [
    {
        network: 'mainnet',
        address: 'KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU',
        token: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
        name: 'Dexter ETHtz Pool',
        scale: 18,
        symbol: 'ETHtz',
    },
    {
        network: 'mainnet',
        address: 'KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9',
        token: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
        name: 'Dexter USDtz Pool',
        scale: 6,
        symbol: 'USDtz',
    },
    {
        network: 'mainnet',
        address: 'KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N',
        token: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        name: 'Dexter tzBTC Pool',
        scale: 8,
        symbol: 'tzBTC',
    },
    {
        network: 'mainnet',
        address: 'KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo',
        token: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH',
        name: 'Dexter wXTZ Pool',
        scale: 6,
        symbol: 'wXTZ',
    },
    {
        network: 'mainnet',
        address: 'KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6',
        token: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        name: 'Dexter kUSD Pool',
        scale: 18,
        symbol: 'kUSD',
    },
    {
        network: 'mainnet',
        address: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', // KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9
        token: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
        name: 'hic et nunc NFT',
        scale: 0,
        symbol: 'OBJKT',
    },
    {
        network: 'mainnet',
        address: 'KT1MWxucqexguPjhqEyk4XndE1M5tHnhNhH7',
        token: 'KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9',
        name: 'QuipuSwap USDtz Pool',
        scale: 6,
        symbol: 'USDtz',
    },
    {
        network: 'mainnet',
        address: 'KT1CiSKXR68qYSxnbzjwvfeMCRburaSDonT2',
        token: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        name: 'QuipuSwap kUSD Pool',
        scale: 18,
        symbol: 'kUSD',
    },
    {
        network: 'mainnet',
        address: 'KT1NABnnQ4pUTJHUwFLiVM2uuEu1RXihAVmB',
        token: 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH',
        name: 'QuipuSwap wXTZ Pool',
        scale: 6,
        symbol: 'wXTZ',
    },
    {
        network: 'mainnet',
        address: 'KT1N1wwNPqT5jGhM91GQ2ae5uY8UzFaXHMJS',
        token: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        name: 'QuipuSwap tzBTC Pool',
        scale: 8,
        symbol: 'tzBTC',
    },
    {
        network: 'mainnet',
        address: 'KT1DX1kpCEfEg5nG3pXSSwvtkjTr6ZNYuxP4',
        token: 'KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8',
        name: 'QuipuSwap ETHtz Pool',
        scale: 18,
        symbol: 'ETHtz',
    },
    {
        network: 'mainnet',
        address: 'KT1R5Fp415CJxSxxXToUj6QvxP1LHaYXaxV6',
        token: 'KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea',
        name: 'QuipuSwap STKR Pool',
        scale: 18,
        symbol: 'STKR',
    },
    {
        network: 'mainnet',
        address: 'KT1QxLqukyfohPV5kPkw97Rs6cw1DDDvYgbB',
        token: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
        name: 'QuipuSwap hDAO Pool',
        scale: 6,
        symbol: 'hDAO',
    },
    {
        network: 'mainnet',
        address: 'KT1KFszq8UFCcWxnXuhZPUyHT9FK3gjmSKm6',
        token: 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf',
        name: 'QuipuSwap USDS Pool',
        scale: 6,
        symbol: 'USDS',
    },
    {
        network: 'mainnet',
        address: 'KT1WtFb1mTsFRd1n1nAYMdrE2Ud9XREz5hjK',
        token: 'KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA',
        name: 'QuipuSwap QLkUSD Pool',
        scale: 36,
        symbol: 'QLkUSD',
    },
    {
        network: 'mainnet',
        address: 'KT1FG63hhFtMEEEtmBSX2vuFmP87t9E7Ab4t',
        token: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
        name: 'QuipuSwap WRAP Pool',
        scale: 8,
        symbol: 'WRAP',
    },
    {
        network: 'mainnet',
        address: 'KT1WYQj3HEt3sxdsV4dMLA8RKzUnYAzXgguS',
        token: 'KT1Nbc9cmx19qFrYYFpkiDoojVYL8UZJYVcj',
        name: 'QuipuSwap GUTS Pool',
        scale: 8,
        symbol: 'GUTS',
    },
];
