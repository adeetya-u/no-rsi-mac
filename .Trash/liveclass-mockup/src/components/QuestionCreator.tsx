import React, { useState } from 'react';

interface QuestionCreatorProps {
  userRole: string;
  onNavigate: (view: string) => void;
}

interface QuestionOption {
  id: string;
  text: string;
}

const QuestionCreator: React.FC<QuestionCreatorProps> = ({ userRole, onNavigate }) => {
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  const [timeLimit, setTimeLimit] = useState(5);
  const [points, setPoints] = useState(10);
  const [showPreview, setShowPreview] = useState(false);

  const questionTypes = [
    { id: 'multiple-choice', label: 'Multiple Choice', icon: '○' },
    { id: 'multi-select', label: 'Multi Select', icon: '☐' },
    { id: 'short-answer', label: 'Short Answer', icon: '✏️' },
    { id: 'long-answer', label: 'Long Answer', icon: '📝' },
    { id: 'likert', label: 'Likert Scale', icon: '📊' },
    { id: 'drawing', label: 'Drawing', icon: '🎨' }
  ];

  const addOption = () => {
    const newOption: QuestionOption = {
      id: Date.now().toString(),
      text: ''
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, text } : option
    ));
  };

  const handleSubmit = () => {
    // In a real app, this would save the question
    alert('Question created successfully!');
    setQuestionText('');
    setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
    setShowPreview(false);
  };

  const renderQuestionPreview = () => {
    if (!questionText) return null;

    return (
      <div className="question-preview">
        <h4>Question Preview</h4>
        <p><strong>Question:</strong> {questionText}</p>
        <p><strong>Type:</strong> {questionTypes.find(t => t.id === questionType)?.label}</p>
        <p><strong>Time Limit:</strong> {timeLimit} minutes</p>
        <p><strong>Points:</strong> {points}</p>
        
        {(questionType === 'multiple-choice' || questionType === 'multi-select') && (
          <div>
            <strong>Options:</strong>
            {options.map((option, index) => (
              <div key={option.id} className="answer-option">
                <span>{questionType === 'multiple-choice' ? '○' : '☐'}</span>
                <span>{option.text || `Option ${index + 1}`}</span>
              </div>
            ))}
          </div>
        )}
        
        {questionType === 'likert' && (
          <div>
            <strong>Scale:</strong>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(num => (
                <label key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <input type="radio" name="likert" value={num} />
                  <span>{num}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        
        {questionType === 'drawing' && (
          <div>
            <strong>Drawing Canvas:</strong>
            <div style={{ 
              width: '100%', 
              height: '200px', 
              border: '2px dashed #ccc', 
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f8f9fa',
              color: '#7f8c8d'
            }}>
              Drawing Canvas (Interactive in real app)
            </div>
          </div>
        )}
      </div>
    );
  };

  if (userRole === 'student') {
    return (
      <div className="question-container">
        <h2>Answer Questions</h2>
        <div style={{ marginBottom: '2rem' }}>
          <h3>Current Questions</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { id: 1, text: "What is the primary purpose of database normalization?", type: "Multiple Choice", timeLeft: "4:32" },
              { id: 2, text: "Explain the ACID properties in database transactions", type: "Short Answer", timeLeft: "7:15" },
              { id: 3, text: "Draw an ER diagram for a library management system", type: "Drawing", timeLeft: "12:45" }
            ].map(question => (
              <div key={question.id} style={{ 
                padding: '1.5rem', 
                border: '1px solid #e1e8ed', 
                borderRadius: '8px',
                background: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0 }}>{question.text}</h4>
                  <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>{question.timeLeft} left</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ 
                    background: '#3498db', 
                    color: 'white', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '12px',
                    fontSize: '0.9rem'
                  }}>
                    {question.type}
                  </span>
                </div>
                <button 
                  className="btn" 
                  style={{ background: '#27ae60' }}
                  onClick={() => alert('Answering question...')}
                >
                  Answer Question
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3>Peer Questions</h3>
          <div style={{ 
            padding: '1.5rem', 
            border: '1px solid #e1e8ed', 
            borderRadius: '8px',
            background: '#f8f9fa'
          }}>
            <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d' }}>
              Questions from your peers will appear here. Answer them to earn participation points!
            </p>
            <button 
              className="btn" 
              style={{ background: '#9b59b6' }}
              onClick={() => alert('No peer questions available right now.')}
            >
              Check for Peer Questions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="question-container">
      <h2>Create New Question</h2>
      
      <div className="question-form">
        <div className="form-group">
          <label>Question Type</label>
          <div className="question-type-selector">
            {questionTypes.map(type => (
              <div
                key={type.id}
                className={`type-option ${questionType === type.id ? 'selected' : ''}`}
                onClick={() => setQuestionType(type.id)}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{type.icon}</div>
                <div>{type.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Question Text</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter your question here..."
            rows={3}
          />
        </div>

        {(questionType === 'multiple-choice' || questionType === 'multi-select') && (
          <div className="form-group">
            <label>Answer Options</label>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={option.id} className="option-input">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      className="remove-option"
                      onClick={() => removeOption(option.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-option" onClick={addOption}>
                Add Option
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-group">
            <label>Time Limit (minutes)</label>
            <input
              type="number"
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              min="1"
              max="60"
            />
          </div>
          <div className="form-group">
            <label>Points</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              min="1"
              max="100"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="button"
            className="btn"
            onClick={() => setShowPreview(!showPreview)}
            style={{ background: '#f39c12' }}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button
            type="button"
            className="btn"
            onClick={handleSubmit}
            style={{ background: '#27ae60' }}
          >
            Create Question
          </button>
        </div>

        {showPreview && renderQuestionPreview()}
      </div>
    </div>
  );
};

export default QuestionCreator;
