Swipe AI Hiring Portal – Project Plan
Project Overview

Swipe is building a modern, AI-powered interview portal with two synchronized views: an Interviewee (Candidate) chat interface and an Interviewer (Recruiter) dashboard. Candidates will browse jobs, upload a PDF/DOCX resume, and engage in a timed chat-based interview. The system uses an LLM (via Groq’s API) to generate full-stack (React/Node) interview questions (6 total: 2 easy, 2 medium, 2 hard with timers of 20s/60s/120s) and to score answers on a 1–10 scale. After the last question, the AI computes a final score and summary for the candidate. Recruiters (or an “admin”) can post multiple jobs with descriptions and optional custom questions, then review all applicants per job, see each candidate’s profile (extracted resume info), chat Q&A history, individual and total scores, and a summary. They can shortlist or reject candidates and trigger email notifications via SMTP. The app is built in React (with Redux for global state), a Flask backend (for LLM calls and emailing), and Supabase (PostgreSQL) for persistent data storage. It follows a clean, professional, mobile-first design with the given color palette and typography guidelines (see UI section). State persistence (using Redux Persist or IndexedDB) is required so that if a user closes or refreshes the page mid-interview, their progress is restored and a “Welcome Back” modal appears. This approach ensures an uninterrupted experience and is supported by best practices: “Redux Persist solves [state loss on refresh] by giving your app a memory”
medium.com
.

User Roles & Workflows

Candidate (Interviewee) Flow: The candidate logs in as a student (via a simple role selector, no auth), views available jobs, and selects one. They upload a resume file (PDF/DOCX). The app uses AI to auto-extract Name, Email, and Phone from the resume. If any field is missing, the chatbot will ask for it before starting. The candidate then enters a chat interview: one question at a time (starting from easy to hard), with a countdown timer (20s easy, 60s medium, 120s hard). The candidate types answers (optionally can use text-to-speech). When time runs out or the candidate submits, the system auto-submits the answer. Each answer is scored by the AI (from 1 to 10) by comparing to an ideal answer. After all 6 questions, the AI returns an overall score and a brief summary feedback. All progress (current Q, timers, answers, scores) is saved locally so the candidate can resume if interrupted. A modal welcomes them back if they return mid-interview. Each candidate can only take the interview once per job (the system checks the record to prevent repeat attempts).

Recruiter (Interviewer) Flow: The recruiter logs in via the “interviewer” role. They can add new job postings (title, description, and any special instructions or specific questions they want the AI to ask). Each job creates a separate entry in the system. The dashboard lists all jobs; selecting a job shows all candidates who applied or took the interview for that job. For each candidate, the dashboard shows their name, final AI score, and status (pending, shortlisted, rejected). Recruiters can search and sort candidates (by name, score, status). Clicking a candidate opens a detail view with their profile (name/email/phone), full chat history (questions, candidate answers, AI scores per answer), and the final AI summary. The recruiter can then click “Shortlist” or “Reject”; this updates the candidate’s status in the database and triggers an SMTP email to the candidate with a notification. This end-to-end flow ensures all applicants for a job are easily managed in one place.

Core Features

Resume Upload & Parsing: Accept PDF/DOCX resumes. Use an AI or parsing library to extract Name, Email, Phone immediately after upload
blog.tooljet.ai
. Populate a form with these fields so the candidate can verify or correct them. This matches examples of AI-ATS systems that scan uploads and display fields
blog.tooljet.ai
.

Missing Info Prompt: If the resume lacked any of Name/Email/Phone, the chat flow will pause to ask the candidate for that information before questions begin.

Timed AI-Driven Interview: The system uses a GPT-like LLM (via Groq’s openai/gpt-oss-20b model) to dynamically generate questions for a Fullstack (React/Node) role. The sequence is fixed: 2 Easy → 2 Medium → 2 Hard questions. Each question appears one at a time in the chat. The app starts a countdown (20 seconds for easy, 60 for medium, 120 for hard). When time elapses or the candidate submits an answer, the answer is immediately sent to the LLM to judge and assign a 1–10 score (comparing against an ideal answer it generates). After the final question, the LLM produces a final score and a short feedback summary. (This follows an approach seen in AI interview tools where LLMs parse resumes and score candidates
blog.tooljet.ai
.)

Interviewee UI: A chat interface (messages view) shows system questions and candidate answers. Each question is displayed with a visible countdown timer. A progress bar or question counter indicates which of 6 Q’s the candidate is on. After finishing, show the AI’s score and summary text. The candidate cannot retake the interview for the same job.

Interviewer UI: A dashboard with job management. The “Add Job” form lets the recruiter create a job with title, description, and optional custom questions to include in the interview (if left blank, AI auto-generates them). After jobs exist, a Job List page shows all jobs. Selecting a job shows a Candidates Table with each applicant’s name, final score, and status. This table supports searching and sorting (e.g. sort by score). Clicking a candidate row shows their Detail View: extracted profile info, entire Q&A chat transcript with individual answer scores, and the AI summary. Buttons on this page allow marking the candidate as Shortlisted or Rejected. On clicking, the app updates the status and calls the backend to send an email via SMTP to the candidate (using the email on file).

Multi-Job & Multi-Candidate: The platform supports multiple jobs (each with its own applicant list). This matches the single-platform requirement: one admin can add many jobs and track interviews for each. Each job can have many candidates. All data is linked by job and candidate identifiers.

Data Model & Storage

We will use Supabase (PostgreSQL) to persist data. Key tables (or collections) include:

Jobs: (id, title, description, instructions, custom_questions[], created_at). For example, a job row might have an array field of extra questions specified by the recruiter. Use a schema similar to typical ATS examples
blog.tooljet.ai
.

Students (Candidates): (id, name, email, phone, resume_url). After uploading, the resume file can be stored (or link in Supabase storage), and contact info saved.

Interviews (Applications): One row per candidate-job interview: (id, job_id→Jobs.id, student_id→Students.id, answers JSON, scores JSON, final_score, summary text, status). The answers field can store an array of question/answer text objects; scores an array of numbers. status is e.g. “completed”, “shortlisted”, or “rejected”. This allows joining jobs and students.

Chat History: (Optional) Instead of separate chat table, the Q&A can live inside Interviews.answers. If needed, a separate Chat table could log each message (with interview_id, role, text, timestamp) for audit, but JSON in the Interviews row is simpler.

All user flow state (current Q index, timers, answers so far) is also kept in the React/Redux state and persisted locally (see below). Final results are written to Supabase so the recruiter can review later. This DB design echoes common ATS structures
blog.tooljet.ai
blog.tooljet.ai
.

Tech Stack & Integration

Frontend: React (possibly with TypeScript). Use a UI library like Ant Design or shadcn for components (buttons, tables, modals, chat bubbles). Implement tabs or routing for switching between Interviewee and Interviewer views.

State Management: Redux (with Redux Toolkit) for global state (user type, interview data, candidate list, etc.). Use redux-persist or a similar solution to store the Redux state to localStorage or IndexedDB so that state is rehydrated on reload
medium.com
. This ensures that if a page is accidentally closed, the candidate’s progress (timers, answers) is not lost. (Best practices note that Redux Persist “gives your app a memory”
medium.com
.) IndexedDB is a good option for offline resilience, enabling large data storage
medium.com
.

Backend & API: A lightweight Python Flask server to handle LLM API calls and emailing. For example, a Flask endpoint /api/generate-question could take the current state and call the Groq client (with baseURL="https://api.groq.com/openai/v1") to fetch a new question. Another endpoint /api/score-answer sends a question+answer to Groq for scoring. A final endpoint /api/send-email can send status emails using Python’s smtplib or flask-mail. Alternatively, Groq/OpenAI calls could be made directly from the frontend (using the JS SDK), but a backend is safer for handling API keys and email credentials.

Database: Supabase (hosted Postgres) for storing jobs, candidates, interviews. Use Supabase JS or restful endpoints in the frontend to fetch/post data (job postings, interview results). Supabase also offers authentication, but since this is a demo with no real login, we’ll skip formal auth and just assume the user role from the “login as” selector.

Resume Parsing: Use a PDF or DOCX parser (like pdf-parse or mammoth.js) or even send the file content to the LLM to extract fields. For example, on file upload, convert to text and send a prompt: “Extract the person’s full name, email address, and phone number.” Display the results in input fields.

LLM (Groq API): Use the provided Groq client code snippet. For question generation, you might prompt something like “Generate a hard React/Node question focusing on backend and frontend integration.”. For scoring: prompt the model with “Here is an ideal answer: [ideal]. Score the user’s answer [answer] on a scale 1–10.” We’ll iterate as needed.

Email (SMTP): Use an SMTP server (or service like SendGrid). After shortlist/reject, call the backend to send an email templated with the candidate’s name and job details.

Tools & Libraries: Redux Persist, IndexedDB (for offline), React Router or Ant Design Tabs, axios or fetch for API calls, moment.js (or plain JS) for timers.

UI/UX Design Guidelines

We will follow the given style guide for a clean, professional, mobile-first design. Key points:

Layout: Mobile-first responsive design. On small screens, use a single-column stack; on larger screens (≥768px, ≥1200px) use multi-column layouts (e.g. chat window beside profile). Max container width ~1280px. Use an 8px base grid for consistent spacing (padding/margins in multiples of 8). Generous whitespace is crucial – add “a lot of breathing room” around elements to achieve a clean look
learnui.design
. Use consistent gutter (24px desktop, 16px mobile).

Colors: Primary brand color #3A7CFF (trustworthy blue) for headers, primary buttons and active states. Secondary accent #FF573A (bright orange) for highlights, danger alerts, or secondary button outlines. Background main #FFFFFF (white) for a spacious canvas. Card/surface background #F8F9FA (light gray) to subtly separate sections. Primary text #333333 (dark charcoal) for high readability; secondary text #6C757D (gray) for subheaders or captions. For example, the navbar and footer can be white with a light border/shadow, using #3A7CFF for the logo/title.

Typography: Use a professional sans-serif (Inter or Poppins). Headings are bold: H1 ~56px desktop (32px mobile), H2 ~32px (24px mobile). Body text ~16px (14px mobile), line-height ~1.5. CTAs (buttons) medium weight ~18px (16px mobile). Ensure text wraps and scales appropriately on small screens.

Navigation Bar: Fixed at top, white background, subtle 1px gray bottom border or shadow. Brand/logo on left. On the right, a role selector: either a dropdown labeled “Login as:” with options “Student” or “Interviewer”, or two buttons for each role. When on mobile, collapse nav items into a hamburger menu that slides out. (Using Ant Design’s responsive menu is fine.)

Buttons & Controls:

Primary Buttons: Filled #3A7CFF background, white text, 8px corner radius. On hover, slightly darken or elevate with shadow. Examples: “Submit”, “Start Interview”, “Shortlist”.

Secondary Buttons: White/transparent background, 1px #3A7CFF border and text, rounded corners. Use for less critical actions (e.g. “Cancel”, “Request Demo”).

Link Buttons: Text in #3A7CFF, underline on hover (for simple link-style actions).

Cards & Panels: Use white or off-white (#F8F9FA) rectangular containers with rounded corners (12–16px radius) and a subtle box-shadow (e.g. 0 4px 6px -1px rgba(0,0,0,0.05)) to lift them off the background. For example, use cards for job listings or profile blocks. Inside cards, apply generous padding (24px+).

Chat Interface: The chat window (Interviewee view) should be a scrollable area with alternating message bubbles. Keep input field fixed at bottom. Use the primary color for system/question bubbles and a lighter gray for candidate responses (or vice versa for contrast). Include a visible timer (e.g. a small countdown badge or progress bar) on each question bubble.

Tables and Lists: On the Interviewer side, use antd’s Table with a clean header row (#F8F9FA background) and rows of white with subtle hover effect. Enable column sorting on score and filtering by status. The search input should be in the header.

Responsive Behavior: Ensure all images/icons use max-width:100%. Use media queries or Ant Design’s Grid breakpoints: e.g., at ~768px switch to a stacked layout; at ~1200px show 2–3 columns where appropriate. Implement subtle CSS transitions for hover states and modal appearances. For example, fade in cards as they scroll into view.

This design follows best practices: it is mobile-first and minimalistic, focusing on whitespace and a limited color palette to achieve a clean look
learnui.design
learnui.design
.

State Persistence & Offline Support

All interview state (uploaded resume data, current question, answers, timers) will be saved locally in the Redux store and persisted with Redux Persist (or a similar solution). This means that if a user refreshes or reopens the browser, the app will rehydrate their state and pop up a “Welcome Back” modal to resume the interview. Redux Persist is explicitly designed for this: it “stores your Redux state […] and rehydrates it” on reload
medium.com
. We may use localForage (IndexedDB) as the storage backend for larger data. This also gives basic offline capability. For example, ongoing answers and timers can be recovered even if the network is lost, ensuring the candidate’s session is not lost. Completed interviews, job postings, and final results will also sync to Supabase so that the recruiter’s dashboard stays up to date.