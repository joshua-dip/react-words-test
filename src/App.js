import React from 'react';
import WordTest from './components/WordTest';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const Header = styled.header`
  text-align: center;
  padding: 40px 0;
  color: #333;
`;

const Title = styled.h1`
  font-size: 2.5em;
  margin: 0;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>영단어 학습</Title>
      </Header>
      <WordTest />
    </AppContainer>
  );
}

export default App;