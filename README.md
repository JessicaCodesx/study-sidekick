# StudySidekick

A polished, offline-capable, all-in-one study assistant designed to help students manage their courses, due dates, notes, flashcards, grades, and study schedules in one beautifully organized place.

##  Features

### Core Features
- **Course Management**: Add, edit, and organize your courses with custom color themes
- **Unit-Based Notes System**: Organize notes by modules/units with rich text markdown editor
- **Flashcard System**: Create Q&A flashcards with spaced repetition learning
- **Calendar & Task Manager**: Track assignments, exams, and other academic tasks
- **Dashboard Overview**: See your daily tasks, study progress, and motivational quotes
- **Academic Records**: Record completed courses, track your GPA over time
- **Study Streak Tracking**: Build consistent study habits with visual progress

### Technical Features
- **Offline-First**: All data is stored locally in your browser
- **No Account Required**: Your data stays on your device, no sign-up needed
- **Dark/Light Mode**: Study comfortably day or night
- **Fully Responsive**: Works on desktop and mobile devices
- **Data Export/Import**: Backup and transfer your study data

##  Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/study-sidekick.git
   cd study-sidekick
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production-ready build:
```bash
npm run build
# or
yarn build
```

## 🏗Tech Stack

- **Frontend**: React + TypeScript
- **UI**: Tailwind CSS + Framer Motion
- **Routing**: React Router
- **State Management**: Context API + useReducer
- **Storage**: IndexedDB (via [idb](https://github.com/jakearchibald/idb))
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/      # UI components 
│   ├── common/      # Shared components (buttons, cards, etc.)
│   ├── courses/     # Course-related components
│   ├── notes/       # Note-related components
│   ├── flashcards/  # Flashcard components
│   ├── calendar/    # Calendar & task components
│   ├── dashboard/   # Dashboard widgets
│   └── layout/      # Layout components (navigation, sidebar)
├── context/         # React context (state management)
├── hooks/           # Custom React hooks
├── lib/             # Utility functions, types, database access
├── pages/           # Page components
└── assets/          # Static assets
```

## Data Storage

StudySidekick uses IndexedDB for client-side storage with the following object stores:

- **courses**: Course information and metadata
- **units**: Course units/modules
- **notes**: Notes content linked to units
- **flashcards**: Flashcard question/answer pairs with spaced repetition data
- **tasks**: Assignments, exams, and other scheduled events
- **academicRecords**: Past courses, grades, and GPA tracking
- **user**: User preferences and study streak data

##  Adding New Features

To create a new feature:

1. Create any necessary components in the appropriate folders
2. Add types to `lib/types.ts` if needed
3. Update database functions in `lib/db.ts` if needed
4. Add reducer actions to `context/AppContext.tsx` if needed
5. Create or update page components in the `pages` directory
6. Add routes to `App.tsx` if creating new pages

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router](https://reactrouter.com/)
- [idb](https://github.com/jakearchibald/idb)
- [Vite](https://vitejs.dev/)

---

## Future Features / Roadmap

- PDF & image upload for lecture slides
- OCR + NLP flashcard generation from notes
- Enhanced spaced repetition algorithm
- Grade calculator & projected GPA for current courses
- Cloud sync (optional)
- Mobile app version
- AI-powered summarization
