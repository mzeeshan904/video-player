import React, { useState, useEffect } from 'react';
import { Ad, PollData, QuizData, CTAData, OverlayData } from '../types';

interface InteractiveAdOverlayProps {
  ad: Ad;
  onAction: (action: string, data: any) => void;
}

const InteractiveAdOverlay: React.FC<InteractiveAdOverlayProps> = ({
  ad,
  onAction,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const interactive = ad.interactive;

  useEffect(() => {
    if (!interactive) return;
    let timer: NodeJS.Timeout;
    
    // Set initial duration based on interactive type
    let duration = 10; // default
    switch (interactive.type) {
      case 'poll':
        duration = (interactive.data as PollData).duration;
        break;
      case 'quiz':
        duration = (interactive.data as QuizData).duration;
        break;
      case 'cta':
        duration = (interactive.data as CTAData).duration;
        break;
      case 'overlay':
        duration = (interactive.data as OverlayData).duration;
        break;
    }
    
    setTimeRemaining(duration);

    timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interactive]);

  if (!interactive) return null;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    if (interactive.type === 'poll') {
      const pollData = interactive.data as PollData;
      onAction('poll_answer', {
        question: pollData.question,
        selectedOption: optionIndex,
        answer: pollData.options[optionIndex],
      });
      setShowResult(true);
    } else if (interactive.type === 'quiz') {
      const quizData = interactive.data as QuizData;
      const isCorrect = optionIndex === quizData.correctAnswer;
      onAction('quiz_answer', {
        question: quizData.question,
        selectedOption: optionIndex,
        answer: quizData.options[optionIndex],
        correct: isCorrect,
      });
      setShowResult(true);
    }
  };

  const handleCTAClick = () => {
    const ctaData = interactive.data as CTAData;
    onAction('cta_click', {
      url: ctaData.url,
      text: ctaData.text,
    });
    window.open(ctaData.url, '_blank');
  };

  if (timeRemaining <= 0 && interactive.type !== 'cta') {
    return null;
  }

  const renderPoll = () => {
    const data = interactive.data as PollData;
    
    return (
      <div className="interactive-content poll-content">
        <h3 className="interactive-title">{data.question}</h3>
        <div className="interactive-options">
          {data.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedOption === index ? 'selected' : ''}`}
              onClick={() => handleOptionSelect(index)}
              disabled={showResult}
            >
              {option}
              {showResult && (
                <span className="option-result">
                  {/* In a real app, you'd show actual poll results */}
                  {Math.floor(Math.random() * 100)}%
                </span>
              )}
            </button>
          ))}
        </div>
        {showResult && (
          <div className="poll-result">
            <p>Thank you for participating!</p>
          </div>
        )}
      </div>
    );
  };

  const renderQuiz = () => {
    const data = interactive.data as QuizData;
    
    return (
      <div className="interactive-content quiz-content">
        <h3 className="interactive-title">{data.question}</h3>
        <div className="interactive-options">
          {data.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedOption === index ? 'selected' : ''
              } ${
                showResult && index === data.correctAnswer ? 'correct' : ''
              } ${
                showResult && selectedOption === index && index !== data.correctAnswer ? 'incorrect' : ''
              }`}
              onClick={() => handleOptionSelect(index)}
              disabled={showResult}
            >
              {option}
            </button>
          ))}
        </div>
        {showResult && (
          <div className="quiz-result">
            <p>
              {selectedOption === data.correctAnswer 
                ? '🎉 Correct!' 
                : `❌ Incorrect. The answer was: ${data.options[data.correctAnswer]}`
              }
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderCTA = () => {
    const data = interactive.data as CTAData;
    
    return (
      <div className="interactive-content cta-content">
        <div className="cta-text">
          <p>{data.text}</p>
        </div>
        <button
          className="cta-button"
          onClick={handleCTAClick}
        >
          {data.buttonText}
        </button>
      </div>
    );
  };

  const renderOverlay = () => {
    const data = interactive.data as OverlayData;
    
    return (
      <div className={`interactive-content overlay-content position-${data.position}`}>
        <div className="overlay-text">
          {data.content}
        </div>
      </div>
    );
  };

  const getPositionClass = () => {
    if (interactive.type === 'overlay') {
      const data = interactive.data as OverlayData;
      return `position-${data.position}`;
    }
    return 'position-bottom-left';
  };

  return (
    <div className={`interactive-ad-overlay ${getPositionClass()}`}>
      <div className="interactive-container">
        {timeRemaining > 0 && interactive.type !== 'cta' && (
          <div className="interactive-timer">
            {timeRemaining}s
          </div>
        )}
        
        {interactive.type === 'poll' && renderPoll()}
        {interactive.type === 'quiz' && renderQuiz()}
        {interactive.type === 'cta' && renderCTA()}
        {interactive.type === 'overlay' && renderOverlay()}
      </div>
    </div>
  );
};

export default InteractiveAdOverlay;
