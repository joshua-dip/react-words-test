import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin: 20px 0;
  text-align: center;
`;

const Button = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  margin: 5px;
  font-size: 16px;
  
  &:hover {
    background: #45a049;
  }
`;

const Input = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  margin: 10px 0;
  width: 200px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #4CAF50;
  color: white;
  padding: 12px;
  text-align: left;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #ddd;
`;

const Tr = styled.tr`
  &:nth-child(even) {
    background: #f9f9f9;
  }
  
  &:hover {
    background: #f5f5f5;
  }
`;

const ChoiceButton = styled(Button)`
  display: block;
  width: 100%;
  margin: 10px 0;
  text-align: left;
  background: white;
  color: #333;
  border: 1px solid #ddd;
  
  &:hover {
    background: #f5f5f5;
  }
  
  &.selected {
    background: #4CAF50;
    color: white;
  }
`;

const TestTypeButton = styled(Button)`
  margin: 0 5px;
`;

const WordTest = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [testType, setTestType] = useState('typing');
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);

  const generateChoices = useCallback((correctWord, wordList) => {
    let choicesList = [correctWord.meaning];
    const otherWords = wordList.filter(word => word.word !== correctWord.word);
    
    while (choicesList.length < 4 && otherWords.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherWords.length);
      const randomMeaning = otherWords[randomIndex].meaning;
      if (!choicesList.includes(randomMeaning)) {
        choicesList.push(randomMeaning);
      }
      otherWords.splice(randomIndex, 1);
    }

    choicesList = choicesList.sort(() => Math.random() - 0.5);
    setChoices(choicesList);
    setSelectedChoice(null);
  }, []);

  const getRandomWord = useCallback((wordList) => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const selectedWord = wordList[randomIndex];
    setCurrentWord(selectedWord);

    if (testType === 'choice') {
      generateChoices(selectedWord, wordList);
    }
  }, [testType, generateChoices]);

  useEffect(() => {
    fetch('/vocabulary.json')
      .then(response => response.json())
      .then(data => {
        setWords(data.vocabulary);
        getRandomWord(data.vocabulary);
      });
  }, [getRandomWord]);

  const checkChoiceAnswer = useCallback((selected) => {
    setSelectedChoice(selected);
    
    if (selected === currentWord.meaning) {
      setMessage('정답입니다! 🎉');
      setTimeout(() => {
        setMessage('');
        getRandomWord(words);
      }, 800);
    } else {
      setMessage('틀렸습니다. 다시 시도해보세요.');
    }
  }, [currentWord, words, getRandomWord]);

  const checkTypingAnswer = useCallback(() => {
    if (userInput.toLowerCase() === currentWord.word.toLowerCase()) {
      setMessage('정답입니다! 🎉');
      setTimeout(() => {
        setUserInput('');
        setMessage('');
        getRandomWord(words);
      }, 800);
    } else {
      setMessage('틀렸습니다. 다시 시도해보세요.');
    }
  }, [currentWord, userInput, words, getRandomWord]);

  const toggleMode = useCallback((mode) => {
    setIsStudyMode(mode === 'study');
    if (mode !== 'study') {
      setTestType(mode);
      getRandomWord(words);
    }
  }, [words, getRandomWord]);

  if (!currentWord) return <div>Loading...</div>;

  return (
    <Container>
      <div>
        <TestTypeButton onClick={() => toggleMode('study')}>
          암기 모드
        </TestTypeButton>
        <TestTypeButton onClick={() => toggleMode('typing')}>
          타이핑 테스트
        </TestTypeButton>
        <TestTypeButton onClick={() => toggleMode('choice')}>
          객관식 테스트
        </TestTypeButton>
      </div>

      {isStudyMode ? (
        <Card>
          <h2>단어 암기장</h2>
          <Table>
            <thead>
              <tr>
                <Th>영어 단어</Th>
                <Th>의미</Th>
              </tr>
            </thead>
            <tbody>
              {words.map((word, index) => (
                <Tr key={index}>
                  <Td>{word.word}</Td>
                  <Td>{word.meaning}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      ) : testType === 'choice' ? (
        <Card>
          <h2>객관식 테스트</h2>
          <h3>{currentWord.word}</h3>
          {choices.map((choice, index) => (
            <ChoiceButton
              key={index}
              onClick={() => checkChoiceAnswer(choice)}
              className={selectedChoice === choice ? 'selected' : ''}
            >
              {choice}
            </ChoiceButton>
          ))}
          <p>{message}</p>
        </Card>
      ) : (
        <Card>
          <h2>타이핑 테스트</h2>
          <h3>{currentWord.meaning}</h3>
          <Input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="영어 단어를 입력하세요"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                checkTypingAnswer();
              }
            }}
          />
          <Button onClick={checkTypingAnswer}>정답 확인</Button>
          <p>{message}</p>
        </Card>
      )}
    </Container>
  );
};

export default WordTest;