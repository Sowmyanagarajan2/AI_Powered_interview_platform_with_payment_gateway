const technicalQuestions = [
  {
    topic: 'JavaScript',
    prompt: 'Which keyword declares a block-scoped variable in JavaScript?',
    options: ['var', 'let', 'static', 'global'],
    answer: 'let'
  },
  {
    topic: 'React',
    prompt: 'Which hook is used to run side effects in a React function component?',
    options: ['useMemo', 'useEffect', 'useRef', 'useReducer'],
    answer: 'useEffect'
  },
  {
    topic: 'HTML',
    prompt: 'Which element is used for the largest heading in HTML?',
    options: ['h6', 'heading', 'h1', 'head'],
    answer: 'h1'
  },
  {
    topic: 'CSS',
    prompt: 'Which CSS property controls the space inside an element border?',
    options: ['margin', 'padding', 'gap', 'outline'],
    answer: 'padding'
  },
  {
    topic: 'Node.js',
    prompt: 'Which module system does Node.js commonly use with require?',
    options: ['CommonJS', 'AMD', 'SystemJS', 'BabelJS'],
    answer: 'CommonJS'
  },
  {
    topic: 'Database',
    prompt: 'Which SQL command is used to read records from a table?',
    options: ['INSERT', 'SELECT', 'UPDATE', 'DROP'],
    answer: 'SELECT'
  },
  {
    topic: 'Git',
    prompt: 'Which command creates a new local Git branch and switches to it?',
    options: ['git branch -d', 'git checkout -b', 'git push -u', 'git merge'],
    answer: 'git checkout -b'
  },
  {
    topic: 'API',
    prompt: 'Which HTTP method is usually used to create a new resource?',
    options: ['GET', 'POST', 'HEAD', 'OPTIONS'],
    answer: 'POST'
  },
  {
    topic: 'Security',
    prompt: 'What is the main purpose of hashing a password?',
    options: ['To compress it', 'To store it safely', 'To make it faster', 'To translate it'],
    answer: 'To store it safely'
  },
  {
    topic: 'System Design',
    prompt: 'Which component is commonly used to decouple producers and consumers?',
    options: ['Message queue', 'CSS grid', 'Browser cookie', 'HTML form'],
    answer: 'Message queue'
  }
];

const hrQuestions = [
  {
    topic: 'Communication',
    prompt: 'What is the best first step when you do not understand a task?',
    options: ['Guess and continue', 'Ask clarifying questions', 'Ignore the task', 'Blame the team'],
    answer: 'Ask clarifying questions'
  },
  {
    topic: 'Teamwork',
    prompt: 'How should you respond when a teammate disagrees with your solution?',
    options: ['Listen and discuss tradeoffs', 'End the conversation', 'Reject all feedback', 'Escalate immediately'],
    answer: 'Listen and discuss tradeoffs'
  },
  {
    topic: 'Ownership',
    prompt: 'What shows strong ownership at work?',
    options: ['Waiting for reminders', 'Hiding blockers', 'Following through on commitments', 'Avoiding updates'],
    answer: 'Following through on commitments'
  },
  {
    topic: 'Adaptability',
    prompt: 'What is a healthy response to changing project requirements?',
    options: ['Refuse all changes', 'Clarify impact and adjust plan', 'Stop communicating', 'Delete previous work'],
    answer: 'Clarify impact and adjust plan'
  },
  {
    topic: 'Conflict',
    prompt: 'What should you focus on during workplace conflict?',
    options: ['Winning the argument', 'Understanding the problem', 'Personal criticism', 'Avoiding all discussion'],
    answer: 'Understanding the problem'
  },
  {
    topic: 'Leadership',
    prompt: 'What is a useful behavior for an entry-level leader?',
    options: ['Share context clearly', 'Keep decisions secret', 'Avoid responsibility', 'Interrupt often'],
    answer: 'Share context clearly'
  },
  {
    topic: 'Time Management',
    prompt: 'What helps most when multiple tasks are urgent?',
    options: ['Prioritize by impact and deadline', 'Work randomly', 'Ignore deadlines', 'Do everything alone'],
    answer: 'Prioritize by impact and deadline'
  },
  {
    topic: 'Feedback',
    prompt: 'How should you receive constructive feedback?',
    options: ['Defend every choice', 'Listen and identify action items', 'Avoid the person', 'Take it personally'],
    answer: 'Listen and identify action items'
  },
  {
    topic: 'Problem Solving',
    prompt: 'What is a good way to approach a difficult problem?',
    options: ['Break it into smaller parts', 'Wait until it disappears', 'Skip testing', 'Copy without understanding'],
    answer: 'Break it into smaller parts'
  },
  {
    topic: 'Culture Fit',
    prompt: 'What does professional reliability usually include?',
    options: ['Clear communication and consistency', 'Only working when watched', 'Avoiding documentation', 'Missing meetings'],
    answer: 'Clear communication and consistency'
  }
];

const technicalVariants = [
  ['What does the virtual DOM help React optimize?', ['Rendering updates', 'Database backups', 'Network cables', 'Image compression'], 'Rendering updates'],
  ['Which array method creates a new array by transforming each item?', ['forEach', 'map', 'push', 'splice'], 'map'],
  ['Which CSS layout is best for one-dimensional alignment?', ['Flexbox', 'Table only', 'Float only', 'Z-index'], 'Flexbox'],
  ['Which status code usually means a request succeeded?', ['200', '301', '404', '500'], '200'],
  ['Which database type stores data in tables with rows and columns?', ['Relational database', 'Graph database', 'Object cache', 'File CDN'], 'Relational database'],
  ['What does JSON stand for?', ['JavaScript Object Notation', 'Java Source Open Network', 'Joined Standard Object Name', 'JavaScript Online Node'], 'JavaScript Object Notation'],
  ['Which command installs dependencies from package.json?', ['npm install', 'npm remove', 'node start', 'git init'], 'npm install'],
  ['Which React prop gives list items a stable identity?', ['key', 'idOnly', 'indexName', 'label'], 'key'],
  ['What does async/await simplify?', ['Working with promises', 'Writing CSS', 'Creating HTML tags', 'Indexing databases'], 'Working with promises'],
  ['Which HTTP method is generally safe and read-only?', ['GET', 'POST', 'PATCH', 'DELETE'], 'GET'],
  ['What is normalization in databases mainly used for?', ['Reducing duplicate data', 'Increasing image size', 'Changing font weight', 'Encrypting CSS'], 'Reducing duplicate data'],
  ['Which Git command records staged changes?', ['git commit', 'git clone', 'git fetch', 'git status'], 'git commit'],
  ['What is the purpose of an index in a database?', ['Improve lookup speed', 'Style table rows', 'Store passwords directly', 'Replace backups'], 'Improve lookup speed'],
  ['Which JavaScript value represents no value intentionally?', ['null', 'NaN', 'Infinity', 'document'], 'null'],
  ['Which CSS unit is relative to the root font size?', ['rem', 'px', 'vh only', 'deg'], 'rem'],
  ['What is CORS related to?', ['Browser cross-origin requests', 'Database sorting', 'CSS shadows', 'Git branches'], 'Browser cross-origin requests'],
  ['Which tool is commonly used to bundle modern frontend apps?', ['Webpack', 'MySQL', 'Postman only', 'Figma'], 'Webpack'],
  ['What does API stand for?', ['Application Programming Interface', 'Advanced Page Index', 'Automated Package Install', 'Application Paint Item'], 'Application Programming Interface'],
  ['Which data structure works as first-in first-out?', ['Queue', 'Stack', 'Tree', 'Graph'], 'Queue'],
  ['Which data structure works as last-in first-out?', ['Stack', 'Queue', 'Map', 'Set only'], 'Stack'],
  ['What is the main role of a load balancer?', ['Distribute traffic', 'Write CSS', 'Compile JSX', 'Store cookies only'], 'Distribute traffic'],
  ['Which storage is cleared when the browser tab session ends?', ['sessionStorage', 'localStorage', 'IndexedDB always', 'CDN cache'], 'sessionStorage'],
  ['What is the purpose of try/catch?', ['Handle errors', 'Style buttons', 'Create routes', 'Optimize images'], 'Handle errors'],
  ['Which React hook stores mutable values without causing re-render?', ['useRef', 'useState', 'useEffect', 'useContext'], 'useRef'],
  ['What does JWT commonly represent?', ['JSON Web Token', 'Java Web Template', 'Joined Web Text', 'JavaScript Worker Thread'], 'JSON Web Token'],
  ['Which SQL clause filters rows?', ['WHERE', 'GROUP BY', 'ORDER BY', 'JOIN'], 'WHERE'],
  ['Which command shows changed files in Git?', ['git status', 'git push', 'git tag', 'git remote add'], 'git status'],
  ['What is the role of middleware in Express?', ['Process request and response flow', 'Draw UI only', 'Create database tables only', 'Compress images only'], 'Process request and response flow'],
  ['Which CSS property changes text color?', ['color', 'background', 'display', 'position'], 'color'],
  ['What does responsive design target?', ['Different screen sizes', 'Only desktop monitors', 'Only printers', 'Only server logs'], 'Different screen sizes'],
  ['Which test checks small pieces of code independently?', ['Unit test', 'Load test', 'Smoke alarm', 'Manual deploy'], 'Unit test'],
  ['Which HTTP status commonly means unauthorized?', ['401', '200', '204', '301'], '401'],
  ['What is debouncing used for?', ['Limiting frequent function calls', 'Deleting databases', 'Centering text', 'Encrypting files'], 'Limiting frequent function calls'],
  ['Which algorithmic notation describes growth rate?', ['Big O', 'HTML', 'RGB', 'JSON'], 'Big O'],
  ['Which HTML attribute connects a label to an input?', ['for', 'src', 'href', 'alt'], 'for'],
  ['Which CSS property controls element stacking order?', ['z-index', 'gap', 'margin', 'line-height'], 'z-index'],
  ['What does REST mainly use for resource actions?', ['HTTP methods', 'CSS classes', 'Git commits', 'NPM scripts'], 'HTTP methods'],
  ['Which database operation permanently removes records?', ['DELETE', 'SELECT', 'INSERT', 'COUNT'], 'DELETE'],
  ['What is the purpose of environment variables?', ['Store configuration outside code', 'Create animations', 'Render HTML', 'Merge arrays'], 'Store configuration outside code'],
  ['Which React hook shares data without prop drilling?', ['useContext', 'useMemo', 'useId', 'useLayoutEffect only'], 'useContext']
];

const hrVariants = [
  ['How should you handle missing a deadline?', ['Communicate early and reset expectations', 'Stay silent', 'Blame another team', 'Hide the delay'], 'Communicate early and reset expectations'],
  ['What is the best way to explain a past mistake?', ['Own it and explain what changed', 'Say it never happened', 'Blame tools only', 'Avoid details entirely'], 'Own it and explain what changed'],
  ['How do you show curiosity in an interview?', ['Ask thoughtful questions', 'Interrupt constantly', 'Avoid discussion', 'Give one-word answers'], 'Ask thoughtful questions'],
  ['What matters most when working remotely?', ['Clear updates and availability', 'Never writing notes', 'Ignoring time zones', 'Avoiding calls always'], 'Clear updates and availability'],
  ['How should you prioritize learning a new tool?', ['Focus on project needs first', 'Read everything forever', 'Avoid practice', 'Wait for perfect training'], 'Focus on project needs first'],
  ['What is a good response to unclear feedback?', ['Ask for examples', 'Reject it immediately', 'Ignore it', 'Complain publicly'], 'Ask for examples'],
  ['How can you build trust with a team?', ['Be consistent and transparent', 'Overpromise often', 'Withhold blockers', 'Skip documentation'], 'Be consistent and transparent'],
  ['What is a good interview answer structure?', ['Situation, action, result', 'Only opinions', 'Random details', 'No examples'], 'Situation, action, result'],
  ['How should you handle repetitive work?', ['Look for safe automation opportunities', 'Ignore quality', 'Refuse the work', 'Rush silently'], 'Look for safe automation opportunities'],
  ['What shows collaboration?', ['Sharing context and listening', 'Working in isolation always', 'Rejecting code reviews', 'Avoiding updates'], 'Sharing context and listening'],
  ['How should you respond to production pressure?', ['Stay calm and communicate priorities', 'Panic silently', 'Skip all checks', 'Make random changes'], 'Stay calm and communicate priorities'],
  ['What is a good way to learn from a senior engineer?', ['Ask specific questions after trying', 'Ask them to do everything', 'Avoid showing work', 'Ignore their advice'], 'Ask specific questions after trying'],
  ['How should you handle disagreement on estimates?', ['Discuss assumptions and risks', 'Pick a number randomly', 'Avoid the topic', 'Promise the shortest time'], 'Discuss assumptions and risks'],
  ['What is professionalism in meetings?', ['Be prepared and respectful of time', 'Arrive late often', 'Interrupt everyone', 'Multitask visibly'], 'Be prepared and respectful of time'],
  ['How do you handle a task outside your comfort zone?', ['Break it down and ask for guidance', 'Reject it instantly', 'Wait without action', 'Pretend it is done'], 'Break it down and ask for guidance'],
  ['What makes feedback useful?', ['Specific examples and next steps', 'Vague criticism', 'Personal attacks', 'No context'], 'Specific examples and next steps'],
  ['How should you communicate blockers?', ['Early, clearly, with what you tried', 'Only after the deadline', 'Never mention them', 'Send blame first'], 'Early, clearly, with what you tried'],
  ['What is a strong answer to "Why this role?"', ['Connect skills, interest, and company needs', 'Say any job is fine', 'Mention salary only', 'Avoid specifics'], 'Connect skills, interest, and company needs'],
  ['How do you demonstrate accountability?', ['Take responsibility for outcomes', 'Avoid hard tasks', 'Hide errors', 'Wait for instructions only'], 'Take responsibility for outcomes'],
  ['What is a good way to handle code review comments?', ['Evaluate and respond respectfully', 'Take every comment personally', 'Ignore all comments', 'Close the review'], 'Evaluate and respond respectfully'],
  ['How do you manage competing priorities?', ['Clarify importance and tradeoffs', 'Do the easiest only', 'Delay communication', 'Pick randomly'], 'Clarify importance and tradeoffs'],
  ['What is the best way to onboard to a new team?', ['Read docs, ask questions, and observe workflow', 'Change everything immediately', 'Avoid teammates', 'Skip setup steps'], 'Read docs, ask questions, and observe workflow'],
  ['How should you answer behavioral questions?', ['Use a concrete example', 'Stay abstract only', 'Give no result', 'Memorize unrelated facts'], 'Use a concrete example'],
  ['What does empathy at work look like?', ['Considering others constraints', 'Assuming bad intent', 'Ignoring workload', 'Speaking over people'], 'Considering others constraints'],
  ['How should you deal with ambiguity?', ['Identify assumptions and next steps', 'Freeze completely', 'Avoid the work', 'Guess without checking'], 'Identify assumptions and next steps'],
  ['What is good documentation?', ['Clear, current, and useful to readers', 'Long but confusing', 'Only screenshots', 'Never updated'], 'Clear, current, and useful to readers'],
  ['How should you handle receiving praise?', ['Acknowledge it and credit collaborators', 'Dismiss everyone else', 'Boast excessively', 'Ignore the team'], 'Acknowledge it and credit collaborators'],
  ['What should you do after a failed interview question?', ['Reflect and practice the gap', 'Give up', 'Blame the interviewer', 'Avoid that topic forever'], 'Reflect and practice the gap'],
  ['How do you show initiative?', ['Spot a need and propose action', 'Wait for every instruction', 'Avoid responsibility', 'Only criticize'], 'Spot a need and propose action'],
  ['What is healthy confidence?', ['Being honest about strengths and gaps', 'Claiming to know everything', 'Never asking questions', 'Rejecting feedback'], 'Being honest about strengths and gaps'],
  ['How should you handle a teammate who is blocked?', ['Offer help or connect them to support', 'Ignore them', 'Criticize publicly', 'Take credit later'], 'Offer help or connect them to support'],
  ['What does continuous improvement mean?', ['Learning from outcomes and adjusting', 'Repeating mistakes', 'Avoiding feedback', 'Only changing titles'], 'Learning from outcomes and adjusting'],
  ['What is a good way to discuss salary timing?', ['Follow the recruiter process professionally', 'Demand it first sentence', 'Avoid all discussion forever', 'Argue aggressively'], 'Follow the recruiter process professionally'],
  ['How do you build credibility as a fresher?', ['Prepare well and communicate honestly', 'Pretend senior experience', 'Hide gaps', 'Avoid examples'], 'Prepare well and communicate honestly'],
  ['What is effective listening?', ['Understanding before responding', 'Waiting only to speak', 'Interrupting quickly', 'Ignoring tone'], 'Understanding before responding'],
  ['How should you handle confidential information?', ['Protect it and follow policy', 'Share it casually', 'Post it publicly', 'Use it in demos'], 'Protect it and follow policy'],
  ['What makes a goal useful?', ['Specific and measurable outcome', 'Vague intention', 'No deadline ever', 'No owner'], 'Specific and measurable outcome'],
  ['How should you approach office politics?', ['Stay professional and focus on work', 'Spread rumors', 'Take sides blindly', 'Avoid all collaboration'], 'Stay professional and focus on work'],
  ['What is a good response to "Tell me about yourself"?', ['Briefly connect background to the role', 'Tell unrelated life story only', 'Read your resume word-for-word', 'Say nothing'], 'Briefly connect background to the role'],
  ['How do you handle stress before an interview?', ['Prepare, breathe, and focus on one question at a time', 'Stop preparing', 'Assume failure', 'Rush every answer'], 'Prepare, breathe, and focus on one question at a time']
];

const makeQuestion = (variant, index, type) => ({
  id: `${type.toLowerCase()}-${String(index + 1).padStart(2, '0')}`,
  type,
  topic: variant.topic || (type === 'Technical' ? 'Core Concepts' : 'Behavioral'),
  difficulty: index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard',
  question: variant.prompt || variant[0],
  options: variant.options || variant[1],
  answer: variant.answer || variant[2]
});

const questionSeed = [
  ...technicalQuestions.map((question, index) => makeQuestion(question, index, 'Technical')),
  ...technicalVariants.map((question, index) => makeQuestion(question, index + technicalQuestions.length, 'Technical')),
  ...hrQuestions.map((question, index) => makeQuestion(question, index, 'HR')),
  ...hrVariants.map((question, index) => makeQuestion(question, index + hrQuestions.length, 'HR'))
];

export default questionSeed;
