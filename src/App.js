import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import defuseImage from './defuse.png';
import defuseWhiteImage from './defuse_white.png';
import confetti from 'canvas-confetti';  // Import confetti

const DefuseGame = () => {
  const [secretNumber, setSecretNumber] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(10);
  const [feedback, setFeedback] = useState('');
  const [digits, setDigits] = useState(['', '', '', '']);
  const [previousPlays, setPreviousPlays] = useState([]);
  const [gameFinished, setGameFinished] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);  // Start in light mode by default
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    generateNumber();

    // Ensure body starts with light mode
    document.body.classList.add('light');
  }, []);

  const generateNumber = () => {
    const randomDigits = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join('');
    setSecretNumber(randomDigits);
    console.log(`Secret number generated: ${randomDigits}`);
  };

  const checkGuess = (guess) => {
    let equals = 0;
    let slashes = 0;
    const secretChecked = Array(4).fill(false);
    const guessChecked = Array(4).fill(false);

    for (let i = 0; i < 4; i++) {
      if (guess[i] === secretNumber[i]) {
        equals++;
        secretChecked[i] = true;
        guessChecked[i] = true;
      }
    }

    for (let i = 0; i < 4; i++) {
      if (!guessChecked[i]) {
        for (let j = 0; j < 4; j++) {
          if (!secretChecked[j] && guess[i] === secretNumber[j]) {
            slashes++;
            secretChecked[j] = true;
            break;
          }
        }
      }
    }

    return '='.repeat(equals) + '/'.repeat(slashes);
  };

  const handleGuess = () => {
    const guess = digits.join('');
    setAttempts(attempts + 1);

    const feedbackMessage = checkGuess(guess);
    setPreviousPlays([...previousPlays, { guess, feedback: feedbackMessage }]);

    if (guess === secretNumber) {
      setFeedback(`You've guessed the number ${secretNumber} correctly! The world is safe!`);
      setGameFinished(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

    } else if (attempts + 1 >= maxAttempts) {
      setFeedback(`The world has ended! The correct number was ${secretNumber}.`);
      setGameFinished(true);
    } else {
      setFeedback(`Feedback: ${feedbackMessage}. Attempts left: ${maxAttempts - attempts - 1}`);
    }

    setDigits(['', '', '', '']);
    inputRefs[0].current.focus();
  };

  const resetGame = () => {
    setAttempts(0);
    setFeedback('');
    setDigits(['', '', '', '']);
    setPreviousPlays([]);
    setGameFinished(false);
    generateNumber();
    inputRefs[0].current.focus();
  };

  const handleDigitChange = (index, value) => {
    if (value.length > 1 || !/^[0-9]$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < inputRefs.length - 1) {
      inputRefs[index + 1].current.focus();
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;

      if (newMode) {
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.body.classList.add('light');
        document.body.classList.remove('dark');
      }

      return newMode;
    });
  };

  return (
    <div className={`game-container ${isDarkMode ? 'dark' : 'light'}`}>
      <button onClick={toggleTheme} className="theme-toggle">
        {isDarkMode ? '🌙' : '☀️'}
      </button>

      <img 
        src={isDarkMode ? defuseWhiteImage : defuseImage} 
        alt="Defuse Game" 
        className="defuse-image" 
      />  

      <div className="input-row">
        {digits.map((digit, index) => (
          <input
            key={index}
            type="text"
            value={digit}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            ref={inputRefs[index]}
            maxLength="1"
            className="pin-input"
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>

      {!gameFinished ? (
        <button onClick={handleGuess} className="submit-button">
          Submit Guess
        </button>
      ) : (
        <button onClick={resetGame} className="submit-button">
          Play Again
        </button>
      )}

      {feedback && <div className="feedback-message">{feedback}</div>}

      <div className="previous-plays">
        {previousPlays.map((play, index) => (
          <div key={index} className="previous-play-item">
            <span className="guess">{index + 1}. Guess: {play.guess}</span>
            <span className="feedback">Feedback: {play.feedback}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DefuseGame;
