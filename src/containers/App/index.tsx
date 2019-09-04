import * as React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 0;
`;

interface Props {
  children: React.ReactNode;
}

export default class App extends React.Component<Props> {
  render() {
    const { children } = this.props;
    return <Container>{children}</Container>;
  }
}
