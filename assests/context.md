App Purpose: A demo AI hiring platform with two user modes (candidate/interviewer) on the same site. React + Redux frontend, Flask backend, Supabase DB.

User Roles:

Student (Candidate): Sees job listings, uploads resume, answers AI-generated interview questions in chat, can resume an unfinished interview, receives final score/summary. Only one attempt per job.

Interviewer (Recruiter): Posts jobs (title/description + optional custom questions), sees list of candidates per job (with AI scores and chat history), can shortlist or reject and send emails.

Interview Flow: 6 Q’s (2 easy, 2 medium, 2 hard). Timers 20s/60s/120s. Use LLM (Groq API) to generate questions and score answers (1-10). After all Q’s, LLM returns final score and summary.

Data Model: Supabase tables: jobs (id, title, description, customQuestions), students (id, name, email, phone, resumeURL), interviews (id, job_id, student_id, answers, scores, final_score, summary, status). Store chat Q&A in JSON. Use Supabase for persistent storage and syncing between tabs.

UI/UX Specs: Follow mobile-first design. Colors: primary #3A7CFF, secondary #FF573A, backgrounds white/#F8F9FA, text #333/#6C757D. Fonts: Inter/Poppins, headings bold (700), sizes ~56px (H1) down to 16px (body). Ample whitespace (padding ~24px, 8px grid) for a clean look
learnui.design
. Navbar fixed top with role selector. Chat interface for candidate, table/list view for interviewer. Use buttons with 8px radius, cards with shadow.

Persistence: Use Redux-Persist (IndexedDB) to save all progress (answers, timers, current Q). On reload, rehydrate state and prompt “Welcome Back” if needed
medium.com
. Completed data syncs to Supabase so the interviewer sees updates.

LLM Integration: Use Groq’s OpenAI-compatible API (model openai/gpt-oss-20b). Example:

const client = new OpenAI({ apiKey: GROQ_KEY, baseURL:"https://api.groq.com/openai/v1" });
const resp = await client.responses.create({ model:"openai/gpt-oss-20b", input:"Your prompt here" });


Use it to generate questions, score answers, and write the final summary.

Email Notifications: When recruiter shortlists/rejects, call Flask backend to send an SMTP email to the candidate’s email on file. Use a simple SMTP library.

No Login Pages: The navbar role selector is only for demo switching. There is no real authentication. Keep flows separate based on chosen role.