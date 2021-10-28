import { ArtToken, VaultToken, Token, TokenKind } from '../types/general';
import { TRANSACTIONS, COLLECTION } from './TabConstants';

import tzbtcIcon from '../../resources/contracts/tzbtc-icon.png';
import usdtzIcon from '../../resources/contracts/usdtz-icon.png';
import ethtzIcon from '../../resources/contracts/ethtz-icon.png';
import wxtzIcon from '../../resources/contracts/wXTZ-token-FullColor.png';
import kusdIcon from '../../resources/contracts/kusd-icon.png';
import hicetnuncIcon from '../../resources/contracts/hicetnunc-icon.png';
import blndIcon from '../../resources/contracts/blnd-icon.png';
import stkrIcon from '../../resources/contracts/stkr-icon.png';
import hdaoIcon from '../../resources/contracts/hdao-icon.png';
import plentyIcon from '../../resources/contracts/plenty-icon.png';
import kalamIcon from '../../resources/contracts/kalam-icon.png';
import stablyIcon from '../../resources/contracts/stably-icon.png';
import hehIcon from '../../resources/contracts/heh-icon.png';
import kdaoIcon from '../../resources/contracts/kdao-icon.png';
import wrapIcon from '../../resources/contracts/wrap-icon.png';
import wusdcIcon from '../../resources/contracts/wusdc-icon.png';
import wlinkIcon from '../../resources/contracts/wlink-icon.png';
import wmaticIcon from '../../resources/contracts/wmatic-icon.png';
import wwbtcIcon from '../../resources/contracts/wwbtc-icon.png';
import wbusdIcon from '../../resources/contracts/wbusd-icon.png';
import btctzIcon from '../../resources/contracts/btctz-icon.png';
import smakIcon from '../../resources/contracts/smak-icon.png';
import flameIcon from '../../resources/contracts/flame-icon.png';
import cloverIcon from '../../resources/contracts/clover-icon.png';
import wcelIcon from '../../resources/contracts/wcel-icon.png';
import uusdIcon from '../../resources/contracts/uusd-icon.png';
import crunchIcon from '../../resources/contracts/crunch-icon.png';
import crdaoIcon from '../../resources/contracts/crdao-icon.png';
import quipuIcon from '../../resources/contracts/quipu-icon.png';
import gifIcon from '../../resources/contracts/gif-icon.png';
import lughIcon from '../../resources/contracts/lugh-icon.png';
import wtzIcon from '../../resources/contracts/wtz-icon.png';
import xplentyIcon from '../../resources/contracts/xplenty-icon.png';
import ctezIcon from '../../resources/contracts/ctez-icon.png';

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
        mapid: 36,
        helpLink: 'https://usdtz.com',
        displayHelpLink: 'usdtz.com',
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
        mapid: 199,
        helpLink: 'https://ethtz.io',
        displayHelpLink: 'ethtz.io',
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
        helpLink: 'https://kolibri.finance/',
        displayHelpLink: 'kolibri.finance',
    },
    {
        network: 'mainnet',
        address: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton',
        displayName: 'hic et nunc',
        symbol: 'OBJKT',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt, // TODO: rename to nft
        icon: hicetnuncIcon,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 511,
        nftMetadataMap: 514,
        helpLink: 'https://www.hicetnunc.xyz/',
        displayHelpLink: 'hicetnunc.xyz',
        marketAddress: 'KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn',
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse',
        displayName: 'Kalamint',
        symbol: 'object',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        icon: kalamIcon,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 857,
        nftMetadataMap: 861,
        helpLink: 'https://kalamint.io/',
        displayHelpLink: 'kalamint.io',
        marketAddress: 'KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse',
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1W89JFPhSEph7S1SbgjwTXibdk5t8GYX5p',
        displayName: 'Kumulus',
        symbol: 'KUM',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 19919,
        nftMetadataMap: 19922,
        helpLink: 'https://kumulus-project.com',
        displayHelpLink: 'kumulus-project.com',
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1SyPgtiXTaEfBuMZKviWGNHqVrBBEjvtfQ',
        displayName: 'GOGOs',
        symbol: 'GOGO',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        icon: kalamIcon,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 20608,
        nftMetadataMap: 20611,
        helpLink: 'https://gogos.tez.page/',
        displayHelpLink: 'gogos.tez',
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ',
        displayName: 'NEONZ',
        symbol: 'NEONZ',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 21217,
        nftMetadataMap: 21220,
        helpLink: 'https://neonz.xyz',
        displayHelpLink: 'neonz.xyz',
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1MsdyBSAMQwzvDH4jt2mxUKJvBSWZuPoRJ',
        displayName: 'PixelPotus',
        symbol: 'POTUS',
        balance: 0,
        transactions: [],
        activeTab: COLLECTION,
        kind: TokenKind.objkt,
        scale: 0,
        precision: 0,
        round: 0,
        mapid: 5627,
        nftMetadataMap: 5631,
        helpLink: 'https://www.pixelpotus.com/',
        displayHelpLink: 'pixelpotus.com',
        hideOnLanding: true,
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
        mapid: 257,
        helpLink: 'https://stakerdao.gitbook.io/stakerdao-faq-and-docs/wrapped-tezos-wxtz-faq-and-docs',
        displayHelpLink: 'stakerdao.gitbook.io',
        vaultCoreAddress: 'KT1V4Vp7zhynCNuaBjWMpNU535Xm2sgqkz6M',
        vaultRegistryMapId: 260,
        vaultList: [],
    },
    {
        network: 'mainnet',
        address: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b',
        displayName: 'Plenty',
        symbol: 'PLENTY',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.plenty,
        icon: plentyIcon,
        scale: 18,
        precision: 18,
        round: 6,
        mapid: 3943,
        balancePath: '$.args[1].int',
        helpLink: 'https://plentydefi.com',
        displayHelpLink: 'plentydefi.com',
    },
    {
        network: 'mainnet',
        address: 'KT1Rpviewjg82JgjGfAKFneSupjAR1kUhbza',
        displayName: 'xPlenty',
        symbol: 'xPLENTY',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: xplentyIcon,
        scale: 18,
        precision: 18,
        round: 6,
        mapid: 18153,
        balancePath: '$.int',
        helpLink: 'https://plentydefi.com',
        displayHelpLink: 'plentydefi.com',
    },
    {
        network: 'mainnet',
        address: 'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT',
        displayName: 'Kalamint DAO',
        symbol: 'KALAM',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: kalamIcon,
        scale: 10,
        precision: 10,
        round: 5,
        mapid: 4178,
        helpLink: 'https://kalamint.io/',
        displayHelpLink: 'kalamint.io',
    },
    {
        network: 'mainnet',
        address: 'KT1Mg7Jaxz9n6YM9XjbDLhAjbuWa9bzhAAy9',
        displayName: 'BTCtez',
        symbol: 'BTCtz',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: btctzIcon,
        tokenIndex: 0,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 16594,
        helpLink: 'https://btctz.io/',
        displayHelpLink: 'btctz.io',
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
        displayHelpLink: 'stakerdao.com',
    },
    {
        network: 'mainnet',
        address: 'KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW',
        displayName: 'hDAO',
        symbol: 'hDAO',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: hdaoIcon,
        scale: 6,
        precision: 6,
        round: 2,
        mapid: 515,
        tokenIndex: 0,
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
        displayHelpLink: 'stakerdao.com',
    },
    {
        network: 'mainnet',
        address: 'KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH',
        displayName: 'Kolibri DAO Token',
        symbol: 'kDAO',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: kdaoIcon,
        scale: 18,
        precision: 18,
        round: 6,
        mapid: 7250,
        balancePath: '$.int',
        displayHelpLink: 'kolibri.finance',
        helpLink: 'https://kolibri.finance',
    },
    {
        network: 'mainnet',
        address: 'KT1XTxpQvo7oRCqp85LikEZgAZ22uDxhbWJv',
        displayName: 'GIF DAO',
        symbol: 'GIF',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: gifIcon,
        scale: 9,
        precision: 9,
        round: 4,
        mapid: 7654,
        helpLink: 'https://gif.games',
        displayHelpLink: 'gif.games',
    },
    {
        network: 'mainnet',
        address: 'KT1SjXiUX63QvdNMcM2m492f7kuf8JxXRLp4',
        displayName: 'ctez',
        symbol: 'ctez',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: ctezIcon,
        scale: 18,
        precision: 18,
        round: 6,
        mapid: 20920,
        balancePath: '$.int',
        displayHelpLink: 'ctez.app',
        helpLink: 'https://ctez.app/',
    },
    {
        network: 'mainnet',
        address: 'KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd',
        displayName: 'WRAP Governance Token',
        symbol: 'WRAP',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wrapIcon,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 1777,
        helpLink: 'https://www.benderlabs.io/wrap-token',
        displayHelpLink: 'benderlabs.io',
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped LINK',
        symbol: 'wLINK',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wlinkIcon,
        tokenIndex: 10,
        scale: 18,
        precision: 8,
        round: 8,
        mapid: 1772,
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped Matic/Polygon',
        symbol: 'wMATIC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wmaticIcon,
        tokenIndex: 11,
        scale: 18,
        precision: 8,
        round: 8,
        mapid: 1772,
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped Celcius',
        symbol: 'wCEL',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wcelIcon,
        tokenIndex: 2,
        scale: 4,
        precision: 4,
        round: 4,
        mapid: 1772,
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped USDC',
        symbol: 'wUSDC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wusdcIcon,
        tokenIndex: 17,
        scale: 6,
        precision: 6,
        round: 2,
        mapid: 1772,
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped BUSD',
        symbol: 'wBUSD',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wbusdIcon,
        tokenIndex: 1,
        scale: 18,
        precision: 18,
        round: 2,
        mapid: 1772,
    },
    {
        network: 'mainnet',
        address: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        displayName: 'Wrapped wBTC',
        symbol: 'wwBTC',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wwbtcIcon,
        tokenIndex: 19,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 1772,
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
        mapid: 31,
        helpLink: 'https://tzbtc.io/',
    },
    {
        network: 'mainnet',
        address: 'KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb',
        displayName: 'Quipu Governance Token',
        symbol: 'QUIPU',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: quipuIcon,
        scale: 6,
        precision: 6,
        round: 6,
        mapid: 12043,
        balancePath: '$.args[0][0].args[1].int',
    },
    {
        network: 'mainnet',
        address: 'KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf',
        displayName: 'Stably USD',
        symbol: 'USDS',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: stablyIcon,
        scale: 6,
        precision: 6,
        round: 2,
        mapid: 397,
    },
    {
        network: 'mainnet',
        address: 'KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA',
        displayName: 'QLkUSD',
        symbol: 'QLkUSD',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: kusdIcon,
        scale: 36,
        precision: 36,
        round: 2,
        mapid: 1600,
        helpLink: 'https://kolibri.finance/liquidity-pool',
        displayHelpLink: 'kolibri.finance/liquidity-pool',
    },
    {
        network: 'mainnet',
        address: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
        displayName: 'youves uUSD',
        symbol: 'uUSD',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        tokenIndex: 0,
        icon: uusdIcon,
        scale: 12,
        precision: 12,
        round: 2,
        mapid: 7706,
        balancePath: '$.int',
        helpLink: 'https://app.youves.com',
        displayHelpLink: 'app.youves.com',
    },
    {
        network: 'mainnet',
        address: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
        displayName: 'Crunch',
        symbol: 'CRUNCH',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: crunchIcon,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 2809,
    },
    {
        network: 'mainnet',
        address: 'KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg',
        displayName: 'Crunchy DAO',
        symbol: 'crDAO',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: crdaoIcon,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 4666,
    },
    {
        network: 'mainnet',
        address: 'KT1Wa8yqRBpFCusJWgcQyjhRz7hUQAmFxW7j',
        displayName: 'Flame Token',
        symbol: 'FLAME',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: flameIcon,
        scale: 6,
        precision: 6,
        round: 6,
        mapid: 2545,
        balancePath: '$.args[1].int',
        helpLink: 'https://spacefarm.xyz',
        displayHelpLink: 'spacefarm.xyz',
    },
    {
        network: 'mainnet',
        address: 'KT1H3LrbC378dPBjTZEK8wVyaknDpQmskRhq',
        displayName: 'ER Ecoworld',
        symbol: 'EREW',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        tokenIndex: 0,
        scale: 8,
        precision: 8,
        round: 8,
        mapid: 5479,
        hideOnLanding: true,
    },
    {
        network: 'mainnet',
        address: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
        displayName: 'SmartLink',
        symbol: 'SMAK',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: smakIcon,
        scale: 3,
        precision: 3,
        round: 3,
        mapid: 1798,
        balancePath: '$.args[1].int',
        helpLink: 'https://www.smartlink.so/use-cases/',
        displayHelpLink: 'smartlink.so',
    },
    {
        network: 'mainnet',
        address: 'KT1PnUZCp3u2KzWr93pn4DD7HAJnm3rWVrgn',
        displayName: 'WTZ',
        symbol: 'WTZ',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: wtzIcon,
        tokenIndex: 0,
        scale: 6,
        precision: 6,
        round: 6,
        mapid: 19486,
    },
    {
        network: 'mainnet',
        address: 'KT1G1cCRNBgQ48mVDjopHjEmTN5Sbtar8nn9',
        displayName: 'Hedgehoge',
        symbol: 'HEH',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: hehIcon,
        scale: 6,
        precision: 6,
        round: 2,
        mapid: 3686,
        balancePath: '$.args[1].int',
        helpLink: 'https://twitter.com/heh_hedgehoge',
        displayHelpLink: '@heh_hedgehoge',
    },
    {
        network: 'mainnet',
        address: 'KT18jyxMDSMJRPPaZjoe49SUkXxax9QZtcWH',
        displayName: 'Four Leaf Clover',
        symbol: 'CLOVER',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip7,
        icon: cloverIcon,
        scale: 6,
        precision: 6,
        round: 6,
        mapid: 6114,
        balancePath: '$.args[1].int',
        helpLink: 'https://twitter.com/heh_hedgehoge',
    },
    /*{
        network: 'mainnet',
        address: 'XXXXX',
        displayName: 'Lugh Euro',
        symbol: 'EURL',
        balance: 0,
        transactions: [],
        activeTab: TRANSACTIONS,
        kind: TokenKind.tzip12,
        icon: lughIcon,
        scale: 6,
        precision: 6,
        round: 6,
        tokenIndex: 0,
        mapid: XXXX,
        balancePath: '$.args[0].int',
        helpLink: 'https://lugh.io',
    },*/
];

export const knownTokenDescription = {
    wXTZ: 'is a fully collateralized representation of XTZ as a token',
    tzBTC: 'is a Tezos token which is fully collateralized with Bitcoin, issued by the Bitcoin Association Switzerland',
    kUSD: 'is a Tezos based stablecoin built on Collateralized Debt Positions (CDPs)',
    USDtz: 'is a stable coin pegged to the value of the United States Dollar',
    ETHtz: 'a StableTez token fully backed by Eth',
    STKR: 'is the governance token for StakerDAO, is built on the FA 1.2 token standard on Tezos',
    PLENTY: 'Plenty Farm DAO token',
    KALAM: 'Kalamint DAO',
    kDAO: 'is a governance token for the Kolibri ecosystem.',
    SMAK: 'SmartLink',
    FLAME: 'is the utility token of FlameDeFi.',
    BTCtz: 'is a Bitcoin-pegged stablecoin.',
    hDAO: ' is the hic et nunc governance token.',
    GIF: ' is governance token of the gif.games ecosystem',
};

export const knownContractNames = {
    KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn: 'tzBTC Token',
    KT1LN4LPSqTMS7Sd2CJw4bbDGRkMv2t68Fy9: 'USDtz Token',
    KT19at7rQUvyjxnZ2fBv7D9zc8rkyG7gAoU8: 'ETHtz Token',
    KT1Mg7Jaxz9n6YM9XjbDLhAjbuWa9bzhAAy9: 'BTCtz Token',
    KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH: 'wXTZ Token',
    KT1V4Vp7zhynCNuaBjWMpNU535Xm2sgqkz6M: 'wXTZ Manager',
    KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV: 'Kolibri Token',
    KT1AEfeckNbdEYwaMKkytBwPJPycz7jdSGea: 'STKR Token',
    KT1MEouXPpCx9eFJYnxfAWpFA7NxhW3rDgUN: 'BLND Token',
    KT1REEb5VxWRjcHm5GzDMwErMmNFftsE5Gpf: 'USDS Token',
    KT1AxaBxkFLCUi3f8rdDAAxBKHfzY8LfKDRA: 'QLkUSD Token',
    KT1LRboPna9yQY9BrjtQYDS1DVxhKESK4VVd: 'WRAP Token',
    KT1Nbc9cmx19qFrYYFpkiDoojVYL8UZJYVcj: 'GUTS Token',
    KT1G1cCRNBgQ48mVDjopHjEmTN5Sbtar8nn9: 'Hedgehoge Token',
    KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng: 'Crunchy.network Token',
    KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg: 'Crunchy.network DAO',
    KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH: 'Kolibri DAO',
    KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b: 'PLENTY Token',
    KT1Rpviewjg82JgjGfAKFneSupjAR1kUhbza: 'xPLENTY Token',
    KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW: 'uUSD',
    KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ: 'Wrap Tokens Container',
    KT193D4vozYnhGJQVtw7CoxxqphqUEEwK6Vb: 'Quipu Governance Token',

    KT1PDrBE59Zmxnb8vXRgRAG1XmvTMTs5EDHU: 'Dexter ETHtz Pool',
    KT1Tr2eG3eVmPRbymrbU2UppUmKjFPXomGG9: 'Dexter USDtz Pool',
    KT1BGQR7t4izzKZ7eRodKWTodAsM23P38v7N: 'Dexter tzBTC Pool',
    KT1D56HQfMmwdopmFLTwNHFJSs6Dsg2didFo: 'Dexter wXTZ Pool',
    KT1AbYeDbjjcAnV1QK7EZUUdqku77CdkTuv6: 'Dexter kUSD Pool',

    KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5: 'Granada tzBTC Pool',

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
    KT1U2hs5eNdeCpHouAvQXGMzGFGJowbhjqmo: 'QuipuSwap wUSDC Pool',
    KT1Lpysr4nzcFegC9ci9kjoqVidwoanEmJWt: 'QuipuSwap wLINK Pool',
    KT1RsfuBee5o7GtYrdB7bzQ1M6oVgyBnxY4S: 'QuipuSwap wMATIC Pool',
    KT1WYQj3HEt3sxdsV4dMLA8RKzUnYAzXgguS: 'QuipuSwap GUTS Pool',
    KT1BgezWwHBxA9NrczwK9x3zfgFnUkc7JJ4b: 'QuipuSwap Hedgehoge Pool',
    KT1CYDRyzipkmRgndFrrYfyiAuwKxkFXxfki: 'QuipuSwap Clover Pool',
    KT1RRgK6eXvCWCiEGWhRZCSVGzhDzwXEEjS4: 'QuipuSwap CRUNCH Pool',
    KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z: 'QuipuSwap PLENTY Pool',
    KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34: 'QuipuSwap KALAM Pool',
    KT1Gdix8LoDoQng7YqdPNhdP5V7JRX8FqWvM: 'QuipuSwap SMAK Pool',
    KT1Q93ftAUzvfMGPwC78nX8eouL1VzmHPd4d: 'QuipuSwap FLAME Pool',
    KT1NEa7CmaLaWgHNi6LkRi5Z1f4oHfdzRdGA: 'QuipuSwap kDAO Pool',
    KT1EtjRRCBC2exyCRXz8UfV7jz7svnkqi7di: 'QuipuSwap uUSD Pool',
    KT1FHiJmJUgZMPtv5F8M4ZEa6cb1D9Lf758T: 'QuipuSwap crDAO Pool',
    KT1DksKXvCBJN7Mw6frGj6y6F3CbABWZVpj1: 'QuipuSwap wWBTC Pool',
    KT1UMAE2PBskeQayP5f2ZbGiVYF7h8bZ2gyp: 'QuipuSwap wBUSD Pool',

    KT1Lw8hCoaBrHeTeMXbqHPG4sS4K1xn7yKcD: 'QuipuSwap FA1.2 Pool Factory',
    KT1SwH9P1Tx8a58Mm6qBExQFTcy2rwZyZiXS: 'Quipuswap FA2 Pool Factory',

    KT1CpeSQKdkhWi4pinYcseCFKmDhs5M74BkU: 'tzcolors Auction House',
    KT1FyaDqiMQWg7Exo7VUiXAgZbd2kCzo3d4s: 'tzcolors NFT',

    KT1Hkg5qeNhfwpKW4fXvq7HGZB9z2EnmCCA9: 'hic et nunc Art House v1',
    KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn: 'hic et nunc Art House v1.1',
    KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton: 'hic et nunc NFT',
    KT1AFA2mwNUMNd4SsujE1YYp29vd8BZejyKW: 'hDAO Token',
    KT1NrAnSjrjp3Bycaw8YKPrDq2aXUTHhq8MF: 'hic et nunc DAO',

    KT1H28iie4mW9LmmJeYLjH6zkC8wwSmfHf5P: 'TzButton Round 2',

    KT1P8n2qzJjwMPbHJfi4o8xu6Pe3gaU3u2A3: 'Tezos Domains Committer',
    KT191reDVKrLxU9rjTSxg53wRqj6zh8pnHgr: 'Tezos Domains Sales',
    KT1CaSP4dn8wasbMsfdtGiCPgYFW7bvnPRRT: 'Tezos Domains Bid',
    KT1TnTr6b2YxSx2xUQ8Vz3MoWy771ta66yGx: 'Tezos Domains Registry',
    KT1J9VpjiH5cmcsskNb8gEXpBtjD4zrAx4Vo: 'Tezos Domains Registry',

    KT1BfQLAsQNX8BjSBzgjTLx3GTd3qhwLoWNz: 'Plenty QuipuSwap Liquidity Farm',
    KT1J7v85udA8GnaBupacgY9mMvrb8zQdYb3E: 'Plenty ETHtz Pool',
    KT1Vs8gqh7YskPnUQMfmjogZh3A5ZLpqQGcg: 'Plenty hDAO Pool',
    KT1JCkdS3x5hTWdrTQdzK6vEkeAdQzsm2wzf: 'Plenty wLINK Pool',
    KT1K5cgrw1A8WTiizZ5b6TxNdFnBq9AtyQ7X: 'Plenty USDtz Pool',
    KT1TNzH1KiVsWh9kpFrWACrDNnfK4ihvGAZs: 'Plenty wMATIC Pool',
    KT1UDe1YP963CQSb5xN7cQ1X8NJ2pUyjGw5T: 'Plenty Pool',

    KT1JQAZqShNMakSNXc2cgTzdAWZFemGcU6n1: 'Plenty 1.1 QuipuSwap Liquidity Farm',
    KT1DjDZio7k2GJwCJCXwK82ing3n51AE55DW: 'Plenty/Kalam QuipuSwap Liquidity Farm',
    KT1QqjR4Fj9YegB37PQEqXUPHmFbhz6VJtwE: 'Plenty 1.1 Pool',
    KT19asUVzBNidHgTHp8MP31YSphooMb3piWR: 'Plenty 1.1 ETHtz Pool',
    KT1Ga15wxGR5oWK1vBG2GXbjYM6WqPgpfRSP: 'Plenty 1.1 hDAO Pool',
    KT1MBqc3GHpApBXaBZyvY63LF6eoFyTWtySn: 'Plenty 1.1 USDtz Pool',
    KT1KyxPitU1xNbTriondmAFtPEcFhjSLV1hz: 'Plenty 1.1 wLINK Pool',
    KT1XherecVvrE6X4PV5RTwdEKNzA294ZE9T9: 'Plenty 1.1 wMATIC Pool',
    KT18oB3x8SLxMJq2o9hKNupbZZ5ZMsgr2aho: 'Plenty 1.1 WRAP Pool',
    KT1WfLprabHVTnNhWFigmopAduUpxG5HKvNf: 'Plenty KALAM Pond',
    KT1GotpjdBaxt2GiMFcQExLEk9GTfYo4UoTa: 'Plenty WRAP Pond',

    KT1XXAavg3tTj12W1ADvd3EEnm1pu6XTmiEF: 'Plenty 1.2 wBUSD Pool',
    KT1PuPNtDFLR6U7e7vDuxunDoKasVT6kMSkz: 'Plenty 1.2 wUSDC Pool',
    KT19Dskaofi6ZTkrw3Tq4pK7fUqHqCz4pTZ3: 'Plenty 1.2 wWBTC Pool',
    KT1KJhxkCpZNwAFQURDoJ79hGqQgSC9UaWpG: 'Plenty wBUSD LP Farm',
    KT1Kp3KVT4nHFmSuL8bvETkgQzseUYP3LDBy: 'Plenty wUSDC LP Farm',
    KT1M82a7arHVwcwaswnNUUuCnQ45xjjGKNd1: 'Plenty wwBTC LP Farm',
    KT1UP9XHQigWMqNXYp9YXaCS1hV9jJkCF4h4: 'Plenty wMATIC LP Farm',
    KT1UqnQ6b1EwQgYiKss4mDL7aktAHnkdctTQ: 'Plenty wLINK LP Farm',
    KT1VCrmywPNf8ZHH95HKHvYA4bBQJPa8g2sr: 'Plenty USDtz LP Farm',

    KT1J5dqegz1qYaYc7X3KjynYL9St1wcZ8ZyV: 'Maelstrom Mixer',

    KT1LXQT3b39wLSiFQ1rHatzALzeKsRGmd8gr: 'Wrap wAAVE Farm',
    KT1Stv6ATejBZ2uD9eMm5HyQ3nrNrC32zpRL: 'Wrap wBUSD Farm',
    KT1PUFe6Gc2k8HKFXFEpVSoCVjM9uWUY54h3: 'Wrap wCEL Farm',
    KT1NSKpB8ppqABLAEDozUmcLv3QUceN5uHQi: 'Wrap wCOMP Farm',
    KT1HLJ9E4nd8a6DnKdrZNXiEHihk5nyJJDoR: 'Wrap wCRO Farm',
    KT1UfeNuqT3F6ntYwucDGPHwHdYa1pQbWfST: 'Wrap wDAI Farm',
    KT1J82G1XVAA4oqjC44qskihdWerrneNVHnn: 'Wrap wETH Farm',
    KT1KY55T9jVZwFaCpRcj62LQNwoVYgtRHG6F: 'Wrap wFTT Farm',
    KT1U9pATbqyDL3ZXzTQnPN2LnaGN78UnpzUw: 'Wrap wHT Farm',
    KT1BKu6MnA86QF7JDUPj8anAEPDJNDsUYs3v: 'Wrap wHUSD Farm',
    KT1N7RC3hLLsKgmKhjnYBiVxY2jfYcohZzwR: 'Wrap wLEO Farm',
    KT1KENVgwsrAnXZHkm5MptHWhMYiXeG5hwa3: 'Wrap wLINK Farm',
    KT19ohHrCtSv5u4RzU3SySZJPKGhcovkf9sS: 'Wrap wMKR Farm',
    KT1GCNfU4RQ85VgQF3fsj69Lgw8Ucz7RGoph: 'Wrap wMATIC Farm',
    KT1K5oY3YC16AgcxPYBDty96xyzVPa89X3yh: 'Wrap wOKB Farm',
    KT1UxnT4id9zKz1tgK1UxwpigFi5ny7vTCu9: 'Wrap wPAX Farm',
    KT1Ls37uwiU2vD7sSBRmUV7ccdNuvgRTxtCQ: 'Wrap wSUSHI Farm',
    KT1UeEeeSfSd7uDWpbxBTBkBBpVeDrcqcUr7: 'Wrap wUNI Farm',
    KT1HVrGpv4GUoSR6qCmkxmHzAFtwfKxzfcop: 'Wrap wUSDC Farm',
    KT1DQg57yTJ7QKxzk6AkPtDGvZYTM5pX4GYE: 'Wrap wUSDT Farm',
    KT1APj29bNiMdrxQ2Nah49MH89TweW84nSXQ: 'Wrap wWBTC Farm',

    KT1EpGgjQs73QfFJs9z7m1Mxm5MTnpC2tqse: 'Kalamint Art House',
    KT1MiSxkVDFDrAMYCZZXdBEkNrf1NWzfnnRR: 'Kalamint Auction Factory',

    KT1Jib9AmhYdbnef2F97uEHtApk2GhuHMQBq: 'StakerDAO STKR Liquidity Farm',
    KT1EAvfbUsed9tbdVzaJKcLM2BSkv7q9oDG1: 'StakerDAO wXTZ Liquidity Farm',
    KT1SxyJctfkEJoHmDA4Vr4DoFexdgdiFp785: 'StakerDAO kUSD Liquidity Farm',

    KT1KnuE87q1EKjPozJ5sRAjQA24FPsP57CE3: 'Crunchy.network Farms',

    KT1HDXjPtjv7Y7XtJxrNc5rNjnegTi2ZzNfv: 'Kolibri kUSD Farm',
    KT1RB179ddATKbCi7E8ben91bo2hqRRPrNQf: 'Kolibri kUSD Liquidity Farm',
    KT18oxtA5uyhyYXyAVhTa7agJmxHCTjHpiF7: 'Kolibri QLPkUSD Farm',

    KT1FvqJwEDWb1Gwc55Jd1jjTHRVWbYKUUpyq: 'objkt NFT Market',

    KT1Pu8f3sau4NZcssm4uXXMYLpHZzQ5UQ1Dz: 'twitz Minter',
    KT1DeFSmknfCG5TveB5DSvrg34hqLcqETNuF: 'twitz NFT',
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
        address: 'KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5',
        token: 'KT1PWx2mnDueood7fEmfbBDKx1D9BAnnXitn',
        name: 'Granada tzBTC Pool',
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
        address: 'KT1RJ6PbjHpwc3M5rw5s2Nbmefwbuwbdxton', // KT1HbQepzV1nVGg8QVznG7z4RcHseD5kwqBn
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
        address: 'KT1K4EwTpbvYN9agJdjpyJm4ZZdhpUNKB3F6',
        token: 'KT1K9gCRgaLRFKTErYt1wVxA3Frb9FjasjTV',
        name: 'QuipuSwap kUSD Pool',
        scale: 18,
        symbol: 'kUSD',
    },
    {
        network: 'mainnet',
        address: 'KT1W3VGRUjvS869r4ror8kdaxqJAZUbPyjMT',
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
        address: 'KT1BMEEPX7MWzwwadW3NCSZe9XGmFJ7rs7Dr',
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
    {
        network: 'mainnet',
        address: 'KT1X1LgNkQShpF9nRLYw3Dgdy4qp38MX617z',
        token: 'KT1GRSvLoikDsXujKgZPsGLX8k8VvR2Tq95b',
        name: 'QuipuSwap PLENTY Pool',
        scale: 18,
        symbol: 'PLENTY',
    },
    {
        network: 'mainnet',
        address: 'KT1J3wTYb4xk5BsSBkg6ML55bX1xq7desS34',
        token: 'KT1A5P4ejnLix13jtadsfV9GCnXLMNnab8UT',
        name: 'QuipuSwap KALAM Pool',
        scale: 10,
        symbol: 'KALAM',
    },
    {
        network: 'mainnet',
        address: 'KT1BgezWwHBxA9NrczwK9x3zfgFnUkc7JJ4b',
        token: 'KT1G1cCRNBgQ48mVDjopHjEmTN5Sbtar8nn9',
        name: 'QuipuSwap HEH Pool',
        scale: 10,
        symbol: 'HEH',
    },
    {
        network: 'mainnet',
        address: 'KT1U2hs5eNdeCpHouAvQXGMzGFGJowbhjqmo',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wUSDC Pool',
        scale: 6,
        symbol: 'wUSDC',
    },
    {
        network: 'mainnet',
        address: 'KT1Lpysr4nzcFegC9ci9kjoqVidwoanEmJWt',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wLINK Pool',
        scale: 18,
        symbol: 'wLINK',
    },
    {
        network: 'mainnet',
        address: 'KT1RsfuBee5o7GtYrdB7bzQ1M6oVgyBnxY4S',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wMATIC Pool',
        scale: 18,
        symbol: 'wMATIC',
    },
    {
        network: 'mainnet',
        address: 'KT1DksKXvCBJN7Mw6frGj6y6F3CbABWZVpj1',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wwBTC Pool',
        scale: 8,
        symbol: 'wwBTC',
    },
    {
        network: 'mainnet',
        address: 'KT1UMAE2PBskeQayP5f2ZbGiVYF7h8bZ2gyp',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wBUSD Pool',
        scale: 18,
        symbol: 'wBUSD',
    },
    {
        network: 'mainnet',
        address: 'KT19Dskaofi6ZTkrw3Tq4pK7fUqHqCz4pTZ3',
        token: 'KT18fp5rcTW7mbWDmzFwjLDUhs5MeJmagDSZ',
        name: 'QuipuSwap wUSDC Pool',
        scale: 6,
        symbol: 'wUSDC',
    },
    {
        network: 'mainnet',
        address: 'KT1Gdix8LoDoQng7YqdPNhdP5V7JRX8FqWvM',
        token: 'KT1TwzD6zV3WeJ39ukuqxcfK2fJCnhvrdN1X',
        name: 'QuipuSwap SMAK Pool',
        scale: 3,
        symbol: 'SMAK',
    },
    {
        network: 'mainnet',
        address: 'KT1Q93ftAUzvfMGPwC78nX8eouL1VzmHPd4d',
        token: 'KT1Wa8yqRBpFCusJWgcQyjhRz7hUQAmFxW7j',
        name: 'QuipuSwap FLAME Pool',
        scale: 6,
        symbol: 'FLAME',
    },
    {
        network: 'mainnet',
        address: 'KT1CYDRyzipkmRgndFrrYfyiAuwKxkFXxfki',
        token: 'KT18jyxMDSMJRPPaZjoe49SUkXxax9QZtcWH',
        name: 'QuipuSwap Clover Pool',
        scale: 6,
        symbol: 'CLOVER',
    },
    {
        network: 'mainnet',
        address: 'KT1NEa7CmaLaWgHNi6LkRi5Z1f4oHfdzRdGA',
        token: 'KT1JkoE42rrMBP9b2oDhbx6EUr26GcySZMUH',
        name: 'QuipuSwap kDAO Pool',
        scale: 18,
        symbol: 'kDAO',
    },
    {
        network: 'mainnet',
        address: 'KT1EtjRRCBC2exyCRXz8UfV7jz7svnkqi7di',
        token: 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW',
        name: 'QuipuSwap uUSD Pool',
        scale: 12,
        symbol: 'uUSD',
    },
    {
        network: 'mainnet',
        address: 'KT1FHiJmJUgZMPtv5F8M4ZEa6cb1D9Lf758T',
        token: 'KT1XPFjZqCULSnqfKaaYy8hJjeY63UNSGwXg',
        name: 'QuipuSwap crDAO Pool',
        scale: 12,
        symbol: 'crDAO',
    },
    {
        network: 'mainnet',
        address: 'KT1RRgK6eXvCWCiEGWhRZCSVGzhDzwXEEjS4',
        token: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
        name: 'QuipuSwap CRUNCH Pool',
        scale: 12,
        symbol: 'CRUNCH',
    },
];
