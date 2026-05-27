import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './InterviewSession.css';
import questionSeed from './data/questionSeed';

const shuffleQuestions = (questions) => [...questions].sort(() => Math.random() - 0.5);
const SESSION_QUESTION_COUNT = 15;
const SESSION_DURATION_SECONDS = 10 * 60;

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const TopBar = React.memo(({ timeRemaining, isTimeUp, onBack }) => (
  <div className="topbar">
    {onBack && (
      <button className="back-btn" onClick={onBack} title="Back to Profile">
        ← Back
      </button>
    )}
    <div className="brand">
      <div className="brand-dot"></div>
      PrepAI - Interview Session
    </div>
    <div className="timer-block">
      <div className={`timer-val ${isTimeUp ? 'timer-ended' : ''}`}>{timeRemaining}</div>
      <div className="timer-label">{isTimeUp ? 'time is up' : 'time remaining'}</div>
    </div>
    <div className="live-badge">
      <div className="live-dot"></div>
      LIVE
    </div>
  </div>
));

const ProgressBar = React.memo(({ progress, questionNumber, totalQuestions }) => (
  <div className="progress-bar-wrap">
    <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
    <div className="progress-q">Q {questionNumber} / {totalQuestions}</div>
  </div>
));

const SessionStats = React.memo(({ answered, skipped, avgScore, remaining }) => (
  <div>
    <div className="panel-label">Session Stats</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px', marginTop: '4px' }}>
      <div className="stat-mini">
        <div className="stat-mini-val" style={{ color: '#10B981' }}>{answered}</div>
        <div className="stat-mini-lbl">Answered</div>
      </div>
      <div className="stat-mini">
        <div className="stat-mini-val" style={{ color: '#F59E0B' }}>{skipped}</div>
        <div className="stat-mini-lbl">Skipped</div>
      </div>
      <div className="stat-mini">
        <div className="stat-mini-val">{avgScore}%</div>
        <div className="stat-mini-lbl">Avg score</div>
      </div>
      <div className="stat-mini">
        <div className="stat-mini-val" style={{ color: '#8B5CF6' }}>{remaining}</div>
        <div className="stat-mini-lbl">Remaining</div>
      </div>
    </div>
  </div>
));

const SkillBreakdown = React.memo(({ skills }) => (
  <div>
    <div className="panel-label">Question Mix</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
      {skills.map((skill) => (
        <div key={skill.name} className="skill-row">
          <div className="skill-name">{skill.name}</div>
          <div className="skill-bar">
            <div
              className="skill-fill"
              style={{ width: `${skill.percentage}%`, background: skill.color }}
            ></div>
          </div>
          <div className="skill-pct">{skill.percentage}</div>
        </div>
      ))}
    </div>
  </div>
));

const staticSkills = [
  { name: 'Technical', percentage: 50, color: '#00D48A' },
  { name: 'HR', percentage: 50, color: '#F59E0B' },
  { name: 'MCQ', percentage: 100, color: '#2451B7' },
  { name: 'Randomized', percentage: 100, color: '#8B5CF6' }
];

const LeftPanel = React.memo(({ answered, skipped, avgScore, remaining }) => (
  <div className="left-panel">
    <SessionStats answered={answered} skipped={skipped} avgScore={avgScore} remaining={remaining} />
    <SkillBreakdown skills={staticSkills} />
  </div>
));

const QuestionCard = React.memo(({ questionNumber, question }) => (
  <div className="q-card">
    <div className="q-meta">
      <div className="q-num">Question {questionNumber}</div>
      <div className="q-type">{question.type}</div>
      <div className="q-tag">{question.topic}</div>
      <div className="q-diff">{question.difficulty}</div>
    </div>
    <div className="q-text">{question.question}</div>
  </div>
));

const OptionList = React.memo(({ options, selectedOption, correctAnswer, showResult, onSelect }) => (
  <div className="option-panel">
    <div className="answer-label">
      <span>Choose one option</span>
      <span className="answer-count">{selectedOption ? '1 / 1 selected' : '0 / 1 selected'}</span>
    </div>
    <div className="option-list">
      {options.map((option) => {
        const isSelected = selectedOption === option;
        const isCorrect = showResult && option === correctAnswer;
        const isWrong = showResult && isSelected && option !== correctAnswer;

        return (
          <button
            key={option}
            type="button"
            className={`option-button ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}
            onClick={() => onSelect(option)}
            disabled={showResult}
          >
            {option}
          </button>
        );
      })}
    </div>
  </div>
));

const ActionButtons = React.memo(({ canSubmit, showResult, onSkip, onVoice, onSubmit }) => (
  <div className="action-row">
    <button className="btn-skip" onClick={onSkip}>Skip</button>
    <button className="btn-record" onClick={onVoice}>Voice</button>
    <button className="btn-submit" onClick={onSubmit} disabled={!canSubmit}>
      {showResult ? 'Next Question' : 'Submit Answer'}
    </button>
  </div>
));

const MainPanel = React.memo(({
  question,
  questionNumber,
  selectedOption,
  feedback,
  onOptionSelect,
  onSkip,
  onSubmit
}) => {
  const handleVoice = useCallback(() => alert('Voice recording started'), []);

  return (
    <div className="main-panel">
      <QuestionCard questionNumber={questionNumber} question={question} />
      <OptionList
        options={question.options}
        selectedOption={selectedOption}
        correctAnswer={question.answer}
        showResult={Boolean(feedback)}
        onSelect={onOptionSelect}
      />
      {feedback && <div className={`result-note ${feedback.isCorrect ? 'success' : 'error'}`}>{feedback.message}</div>}
      <ActionButtons
        canSubmit={Boolean(selectedOption)}
        showResult={Boolean(feedback)}
        onSkip={onSkip}
        onVoice={handleVoice}
        onSubmit={onSubmit}
      />
    </div>
  );
});
const AICoach = React.memo(({ feedback, hints, keywords }) => (
  <div className="ai-panel">
    <div className="ai-header">
      <div className="ai-dot"></div>
      <div className="ai-title">AI Coach - Live</div>
    </div>
    <div className="ai-text">{feedback}</div>
    {hints.map((hint) => (
      <div key={hint} className="hint-row">
        <div className="hint-bullet"></div>
        <div className="hint-txt">{hint}</div>
      </div>
    ))}
    <div className="keyword-row">
      {keywords.map((keyword) => (
        <div key={keyword} className="keyword">{keyword}</div>
      ))}
    </div>
  </div>
));

const ConfidenceMeter = React.memo(({ score, trend }) => (
  <div className="confidence-meter">
    <div className="conf-label">AI confidence score</div>
    <div className="conf-arc">
      <div className="conf-val">{score}</div>
      <div>
        <div style={{ fontSize: '12px', color: '#C2D6FA', fontWeight: '500' }}>/ 100</div>
        <div className="conf-sub">Trending {trend}</div>
      </div>
    </div>
  </div>
));
const RightPanel = React.memo(({ question }) => {
  const hints = useMemo(() => (
    question.type === 'Technical'
      ? [
        'Think about the core concept before choosing',
        'Eliminate options that do not match the topic',
        'Connect the answer to real project usage'
      ]
      : [
        'Choose the option that shows ownership',
        'Prefer clear communication and collaboration',
        'Look for a professional action, not blame'
      ]
  ), [question.type]);

  const keywords = useMemo(() => [question.type, question.topic, question.difficulty], [question.type, question.topic, question.difficulty]);

  return (
    <div className="right-panel">
      <AICoach
        feedback={`Current question is from ${question.topic}. Focus on the strongest practical answer.`}
        hints={hints}
        keywords={keywords}
      />
      <ConfidenceMeter score={74} trend="up" />
    </div>
  );
});

const SummaryScreen = React.memo(({
  totalQuestions,
  answered,
  skipped,
  correct,
  wrong,
  score,
  timeRemaining,
  onRestart
}) => (
  <div className="summary-panel">
    <div className="summary-header">
      <p>Session complete</p>
      <h2>Your interview result</h2>
    </div>

    <div className="summary-score">
      <span>{score}%</span>
      <p>Final score</p>
    </div>

    <div className="summary-grid">
      <div className="summary-item">
        <strong>{totalQuestions}</strong>
        <span>Total questions</span>
      </div>
      <div className="summary-item">
        <strong>{answered}</strong>
        <span>Answered</span>
      </div>
      <div className="summary-item">
        <strong>{correct}</strong>
        <span>Correct</span>
      </div>
      <div className="summary-item">
        <strong>{wrong}</strong>
        <span>Wrong</span>
      </div>
      <div className="summary-item">
        <strong>{skipped}</strong>
        <span>Skipped</span>
      </div>
      <div className="summary-item">
        <strong>{timeRemaining}</strong>
        <span>Time left</span>
      </div>
    </div>

    <button type="button" className="btn-submit summary-button" onClick={onRestart}>
      Start New Session
    </button>
  </div>
));

const InterviewSession = ({ onBackToProfile, user }) => {
  const [sessionKey, setSessionKey] = useState(0);
  const [questions, setQuestions] = useState(() =>
    shuffleQuestions(questionSeed).slice(0, SESSION_QUESTION_COUNT)
  );
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_DURATION_SECONDS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [answered, setAnswered] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const questionNumber = currentQuestionIndex + 1;
  const progress = isFinished ? 100 : (questionNumber / totalQuestions) * 100;
  const wrong = Math.max(0, answered - correct);
  const finalScore = totalQuestions === 0 ? 0 : Math.round((correct / totalQuestions) * 100);
  const avgScore = answered === 0 ? 0 : Math.round((correct / answered) * 100);
  const remaining = isFinished ? 0 : Math.max(0, totalQuestions - questionNumber);

  useEffect(() => {
    if (isFinished) {
      return undefined;
    }

    setSecondsRemaining(SESSION_DURATION_SECONDS);
    const endTime = Date.now() + SESSION_DURATION_SECONDS * 1000;

    const updateSeconds = () => {
      const nextSeconds = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));

      setSecondsRemaining((current) => {
        if (current !== nextSeconds) {
          return nextSeconds;
        }
        return current;
      });

      if (nextSeconds === 0) {
        setIsFinished(true);
      }
    };

    updateSeconds();
    const timerId = setInterval(updateSeconds, 1000);

    return () => clearInterval(timerId);
  }, [sessionKey, isFinished]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex >= totalQuestions - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentQuestionIndex((current) => current + 1);
    setSelectedOption('');
    setFeedback(null);
  };

  const handleSkip = () => {
    if (isFinished) {
      return;
    }

    setSkipped((current) => current + 1);
    goToNextQuestion();
  };

  const handleSubmit = () => {
    if (isFinished) {
      return;
    }

    if (feedback) {
      goToNextQuestion();
      return;
    }
    const isCorrect = selectedOption === currentQuestion.answer;
    setAnswered((current) => current + 1);
    if (isCorrect) {
      setCorrect((current) => current + 1);
    }

    setFeedback({
      isCorrect,
      message: isCorrect
        ? 'Correct answer. Nice work.'
        : `Not quite. Correct answer: ${currentQuestion.answer}`
    });
  };
  const handleRestart = () => {
    setQuestions(shuffleQuestions(questionSeed).slice(0, SESSION_QUESTION_COUNT));
    setSessionKey((current) => current + 1);
    setCurrentQuestionIndex(0);
    setSelectedOption('');
    setFeedback(null);
    setAnswered(0);
    setSkipped(0);
    setCorrect(0);
    setIsFinished(false);
  };
  return (
    <div className="screen">
      <TopBar
        timeRemaining={formatTime(secondsRemaining)}
        isTimeUp={secondsRemaining === 0}
        onBack={onBackToProfile}
      />
      <ProgressBar progress={progress} questionNumber={questionNumber} totalQuestions={totalQuestions} />
      {isFinished ? (
        <SummaryScreen
          totalQuestions={totalQuestions}
          answered={answered}
          skipped={skipped}
          correct={correct}
          wrong={wrong}
          score={finalScore}
          timeRemaining={formatTime(secondsRemaining)}
          onRestart={handleRestart}
        />
      ) : (
        <div className="body">
          <LeftPanel answered={answered} skipped={skipped} avgScore={avgScore} remaining={remaining} />
          <MainPanel
            question={currentQuestion}
            questionNumber={questionNumber}
            selectedOption={selectedOption}
            feedback={feedback}
            onOptionSelect={setSelectedOption}
            onSkip={handleSkip}
            onSubmit={handleSubmit}
          />
          <RightPanel question={currentQuestion} />
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
