# Interview Session React App

A React-based UI for an interactive interview session platform featuring real-time question display, answer submission, and AI coaching feedback.

## Features

- **TopBar**: Brand name, countdown timer, and live badge
- **Left Panel**: Session statistics and skill breakdown with progress bars
- **Main Panel**: Question display, answer text area with word count, and action buttons
- **Right Panel**: AI coach feedback with hints and confidence meter
- **Animations**: Pulsing indicators, timer animations, and smooth transitions

## Project Structure

```
d:\FSD_203\Real_time_project\
├── public/
│   └── index.html
├── App.jsx
├── InterviewSession.jsx
├── InterviewSession.css
├── index.js
├── index.css
├── package.json
├── .gitignore
└── README.md
```

## Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   The app will open in your browser at `http://localhost:3000`

3. **Build for production**:
   ```bash
   npm build
   ```

## Component Hierarchy

- **App**: Main application container
  - **InterviewSession**: Root component for the interview UI
    - **TopBar**: Header with timer and brand info
    - **ProgressBar**: Visual progress indicator
    - **LeftPanel**: Session stats and skills
    - **MainPanel**: Main content area with question and answer
    - **RightPanel**: AI coaching and metrics

## Components

### TopBar
Displays the brand name, remaining time, and live status indicator.

### ProgressBar
Shows progress through the interview with question counter.

### LeftPanel
- **SessionStats**: Displays answered, skipped, average score, and remaining questions
- **SkillBreakdown**: Shows proficiency bars for Clarity, Depth, Examples, and Structure

### MainPanel
- **QuestionCard**: Displays the current question with metadata
- **AnswerBox**: Text area for user's answer with word count tracking
- **ActionButtons**: Skip, Voice record, and Submit buttons

### RightPanel
- **AICoach**: Provides real-time feedback, hints, and relevant keywords
- **ConfidenceMeter**: Shows AI confidence score with trend indicator

## Styling

The application uses CSS modules for styling with a dark theme featuring:
- Primary colors: Deep blue (#0B1437), Light purple (#8B5CF6)
- Accent colors: Green (#00F5A0, #00D48A), Orange (#F59E0B), Red (#EF4444)
- Smooth animations and transitions

## Interactive Features

- Click "Skip" to skip the current question
- Click "⏺ Voice" to enable voice recording
- Click "Submit Answer →" to submit your response
- Real-time word count in the answer box

## Future Enhancements

- Add state management (Redux/Context API) for multi-question sessions
- Implement voice recording functionality
- Add real-time AI feedback updates
- Create progress persistence with localStorage
- Add animations on question transitions

## License

MIT
