# 🚀 CareerPulse AI - Your AI-Powered Career Accelerator

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://ai-job-genius.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

An AI-powered career coaching platform that helps students, freshers, and professionals land their dream jobs through intelligent resume building, mock interviews, and personalized career guidance.

![CareerPulse AI](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)

## ✨ Features

### 🎯 AI Career Assessment
- Personalized career path recommendations
- Skills gap analysis
- Industry-specific insights

### 📝 Smart Resume Builder
- Multiple professional templates (Classic, Modern, Creative, Executive, Minimal, Tech)
- AI-powered content suggestions
- ATS (Applicant Tracking System) score optimization
- One-click PDF export

### 🎤 AI Mock Interviews
- Voice-based interview practice with AI interviewer
- Real-time feedback and scoring
- Industry-specific questions
- Interview history and progress tracking

### 💼 Job Search
- Real-time job listings from multiple sources
- Personalized job recommendations
- One-click apply links

### 📊 Career Path Planning
- AI-generated career roadmaps
- Skill development recommendations
- Salary insights and market trends

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React 19, TypeScript, Tailwind CSS |
| **Authentication** | Clerk |
| **Database** | Supabase (PostgreSQL) |
| **AI/LLM** | Groq (Llama 3) |
| **Voice AI** | VAPI |
| **Job Data** | RapidAPI (JSearch) |
| **Deployment** | Vercel |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sushilkumar21775/Ai_job_Genius.git
   cd Ai_job_Genius
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
   
   # Groq AI
   GROQ_API_KEY=your_groq_api_key
   
   # RapidAPI (Job Search)
   RAPIDAPI_KEY=your_rapidapi_key
   
   # VAPI (Voice AI)
   VAPI_PRIVATE_KEY=your_vapi_private_key
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
   NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
├── app/
│   ├── api/              # API routes (backend)
│   ├── auth/             # Authentication pages
│   ├── dashboard/        # Dashboard pages
│   └── onboarding/       # Onboarding flow
├── components/           # Reusable UI components
├── lib/                  # Utilities and configurations
└── supabase/            # Database schema and migrations
```

## 🔒 Security

- All API keys and secrets are stored in environment variables
- `.env.local` is gitignored and never committed
- Authentication handled by Clerk with secure session management
- Row Level Security (RLS) enabled on Supabase

## 📄 License

This project is for educational purposes.

## 👨‍💻 Author

**Sushil Kumar Patil**

---

⭐ Star this repo if you find it helpful!
