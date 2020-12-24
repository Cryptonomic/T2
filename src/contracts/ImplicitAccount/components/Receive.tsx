import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

import styled from 'styled-components';

import { ms } from '../../../styles/helpers';
import TezosAddress from '../../../components/TezosAddress';

const ReceiveContainer = styled.div`
    display: flex;
    width: 100%;
    padding: ${ms(2)} 0 ${ms(6)} 0;

    @media (max-width: 1200px) {
        flex-direction: column;
        align-items: center;
    }
`;

const QRCodeContainer = styled.canvas`
    border: 1px solid ${({ theme: { colors } }) => colors.gray1};
    width: ${ms(9)};
    height: ${ms(9)};
    margin: 0 ${ms(5)} 0 0;
    @media (max-width: 1200px) {
        margin: 0;
    }
`;

const HashContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: ${({ theme: { colors } }) => colors.primary};
    position: relative;

    @media (max-width: 1200px) {
        align-items: center;
    }
`;

interface Props {
    address: string;
}

function Receive(props: Props) {
    const { address } = props;
    const canvasRef = useRef(null);

    function renderQRCode() {
        try {
            QRCode.toCanvas(canvasRef.current, address, { width: 190 }, (err) => {
                if (err) {
                    console.error(err);
                }
            });
        } catch (e) {
            console.error(e);
        }
    }

    useEffect(() => {
        renderQRCode();
    }, [address]);

    return (
        <ReceiveContainer>
            <QRCodeContainer ref={canvasRef} />
            <HashContainer>
                <TezosAddress address={address} size="16px" weight={300} color="primary" text={address} />
            </HashContainer>
        </ReceiveContainer>
    );
}

export default Receive;
