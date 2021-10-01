export interface MediaProps {
    className?: string;
    source: string;
    type?: string;
    alt?: string;
    enablePreview?: boolean;
    FailedBox?: React.ReactElement | JSX.Element;
    useNFTFailedBox?: boolean;
    nftProvider?: string;
}
