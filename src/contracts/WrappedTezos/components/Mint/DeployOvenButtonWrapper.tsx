import React from 'react';
import { Container } from '../style';

/** Renders a wrapper around a component that includes a "Deploy Oven" button */
const DeployOvenButtonWrapper = (props) => {
    const { children } = props;
    return (
        <Container>
            {/* TODO(keefertaylor): Wire this button to a modal */}
            <button>Deploy Oven</button>
            {children}
        </Container>
    );
};

export default DeployOvenButtonWrapper;
