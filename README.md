🌐 SocialApp - Modern Social Media Platform
A full-featured, responsive Social Media Web Application built with Next.js 15 (App Router), TypeScript, Redux Toolkit, and Material UI (MUI). It enables users to post content, interact with feeds, share posts, view real-time notifications with audio alerts, bookmark posts, and manage profiles seamlessly.

✨ Key Features
🔐 Authentication & Authorization:

Full User Registration with Profile Image Uploads.

Form Validation using Formik & Yup.

Dynamic Authentication State Management (JWT Token decoding & persistence).

Password Management (Change Password Feature).

📰 Posts & Feed Management:

Create, Read, Update, and Delete (CRUD) Posts with image attachments.

Interactive Share Post mechanism embedded within the feed.

Integrated Bookmarks System to save favorite posts for later viewing.

Dynamic Single Post View page (/singlepost/[postid]).

💬 Comments & Replies System:

Add and Delete comments in real-time.

View top comments & nested comment replies dynamically.

🔔 Real-Time Notifications:

Interactive Navigation Bar Notification Center.

Automatic polling for unread notifications count.

Custom Audio Alerts via Web Audio API upon receiving new interactions.

Deep-linking to target post upon clicking a notification.

👤 Profile & User Social Network:

Personalized User Profile Page (/profile).

Dynamic User Profile Routing (/user/[userid]).

Interactive Follow Suggestions component to discover new users.

🛠️ Tech Stack & Tools
Framework: Next.js 15 (App Router)

Language: TypeScript

State Management: Redux Toolkit

UI Components & Styling: Material UI (MUI) & Emotion

Form Handling: Formik & Yup

Notifications & Toasts: React Hot Toast

Icons: MUI Icons

Utility Libraries: jwt-decode

📂 Project Architecture
Plaintext
src/
├── app/
│   ├── _components/          # Reusable UI Components
│   │   ├── addpost/          # Post creation input card
│   │   ├── follow-suggestions/# Suggested users to follow
│   │   └── posts/            # Generic post card renderer
│   ├── _navbar/              # Navigation bar & Notification Menu
│   ├── _posts/               # Feed posts section
│   ├── bookmarks/            # User Bookmarked Posts page
│   ├── change-password/      # User security settings
│   ├── createpost/           # Standalone post creation page
│   ├── login/                # User login page
│   ├── profile/              # Logged-in user profile page
│   ├── register/             # User signup & photo upload page
│   ├── singlepost/[postid]/  # Single Post view with full comments
│   └── user/[userid]/        # Dynamic User Profile view page
├── interfaces/
│   └── state.ts              # TypeScript interfaces & types
└── lib/                      # Redux Slices & Services
    ├── commentslice.ts       # Comment Reducer
    ├── loginslice.ts         # Auth & Session Reducer
    ├── notificationslice.ts # Real-time Notifications Reducer
    ├── postslice.ts          # Posts CRUD & Feed Reducer
    ├── userslice.ts          # Profile & User Follow Reducer
    ├── store.ts              # Global Redux Store
    └── sound.ts              # Web Audio API notification sound generator
🚀 Getting Started
Prerequisites
Node.js >= 18.x

npm / yarn / pnpm

Installation
Clone the repository:

Bash
git clone https://github.com/Mohamed12-6/social-app.git
cd next-project
Install dependencies:

Bash
npm install
Run the development server:

Bash
npm run dev
Open the browser:
Navigate to http://localhost:3000 to see the application in action.

📦 Production Build
To build the project for production, run:

Bash
npm run build
To start the production server after building:

Bash
npm start