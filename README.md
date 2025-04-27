# XBites Demo

A web application that lets you talk with an AI agent. The app looks like a video call interface, but it's actually a conversation with an AI. The AI can talk back to you using a realistic voice. The app saves your conversations so you can look at them later.

## 🚀 Features

- Talk with an AI agent using your voice
- The AI agent talks back with a realistic voice
- See what you and the AI said in text
- Save and look at your past conversations
- Simple and easy-to-use interface
- Works on computers and phones

## 🏗️ Project Structure

```
.
├── xbites-googlemeet/          # Main application
│   ├── app/                    # Pages and routes
│   ├── components/             # UI parts
│   ├── lib/                    # Helper code
│   └── public/                 # Images and files
└── supabase-backend/          # Database and storage
    ├── supabase/              # Database setup
    └── db_schema.sql          # How data is stored
```

## 🛠️ Technologies Used

### Frontend (What you see)
- **Next.js** - Makes the website fast and modern
- **React** - Builds the user interface
- **Tailwind CSS** - Makes the app look nice
- **Radix UI** - Makes buttons and controls work well
- **ElevenLabs** - Makes the AI voice sound real

### Backend (What you don't see)
- **Supabase** - Stores your conversations
- **PostgreSQL** - Database for saving data

## 📦 How to Run the Project

### Try the Demo
You can try the app without installing anything: [Live Demo](https://google-meet-demo-n8zq.vercel.app/)

### Run on Your Computer

1. Get the code:
```bash
git clone [repository-url]
```

2. Go to the project folder and install needed files:
```bash
cd xbites-googlemeet
npm install --force
```

3. Create a file named `.env.local` in the `xbites-googlemeet` folder. Add these lines:
```
# ElevenLabs Conversational AI Agent ID
AGENT_ID=""
ELEVENLABS_API_KEY=""
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EDGE_FUNCTION_URL=
```

4. Start the app:
```bash
npm run dev
```

5. Open your web browser and go to: `http://localhost:3000`

## 🗄️ How Data is Stored

The app saves your conversations in a table called `conversations` with these details:
- `id` - Unique number for each conversation
- `agent_id` - Which AI you talked to
- `start_time` - When you started talking
- `end_time` - When you finished talking
- `duration` - How long you talked (in seconds)
- `transcript` - What you and the AI said
- `created_at` - When the conversation was saved
- `updated_at` - When the conversation was last changed

## 🔒 Keeping Your Data Safe

- Your API keys are kept secret in environment files
- The app uses secure ways to save and get your data
- Only you can see your conversations
