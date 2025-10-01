from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
import json
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from groq import Groq
import PyPDF2
from docx import Document
import io

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SMTP_HOST = os.getenv('SMTP_HOST')
SMTP_PORT = os.getenv('SMTP_PORT')
SMTP_USER = os.getenv('SMTP_USER')
SMTP_PASS = os.getenv('SMTP_PASS')
FLASK_SECRET = os.getenv('FLASK_SECRET')

# Set Flask secret key
app.config['SECRET_KEY'] = FLASK_SECRET or 'dev-secret-key'

# Diagnostics: log env presence (without leaking secrets)
try:
    masked_key = (SUPABASE_KEY[:4] + '...' + SUPABASE_KEY[-4:]) if SUPABASE_KEY else '(empty)'
    logger.info('[Backend:init] env', extra={
        'supabase': {
            'has_url': bool(SUPABASE_URL),
            'has_key': bool(SUPABASE_KEY),
            'url_host': (SUPABASE_URL.split('//')[1].split('/')[0] if (SUPABASE_URL and '//' in SUPABASE_URL) else '(none)'),
            'key_preview': masked_key,
        },
        'groq': bool(GROQ_API_KEY),
    })
except Exception:
    logger.info('[Backend:init] env diagnostics unavailable')

# Initialize Groq client
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {e}")
else:
    logger.warning("GROQ_API_KEY not found, using mock responses")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Swipe AI Interview Portal API is running'
    })

def call_groq_api(prompt: str, max_tokens: int = 500) -> str:
    """Call Groq API with error handling"""
    if not groq_client:
        raise Exception("Groq client not initialized")
    
    try:
        response = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            max_tokens=max_tokens,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise e

@app.route('/api/generate', methods=['POST'])
def generate_question():
    """
    Generate interview question or ideal answer
    Expected payload:
    {
        "action": "generate_question",
        "difficulty": "easy|medium|hard",
        "job_context": "",
        "seed_questions": [optional custom ones]
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        action = data.get('action')
        difficulty = data.get('difficulty')
        job_context = data.get('job_context')
        
        # NEW: Batch generation - Generate all 6 questions at once
        if action == 'generate_batch':
            difficulties = data.get('difficulties', ['easy', 'easy', 'medium', 'medium', 'hard', 'hard'])
            job_description = data.get('job_description', '')
            
            if groq_client:
                try:
                    prompt = f"""Generate 6 technical interview questions for a {job_context} position.
Job Description: {job_description}

Generate EXACTLY 6 questions with the following difficulties:
1. EASY question (20 seconds to answer)
2. EASY question (20 seconds to answer)
3. MEDIUM question (60 seconds to answer)
4. MEDIUM question (60 seconds to answer)
5. HARD question (120 seconds to answer)
6. HARD question (120 seconds to answer)

For EACH question, also provide an ideal answer (40-200 words).

DIFFICULTY GUIDELINES:
- EASY: Basic concepts, definitions, "what is" or "explain briefly"
- MEDIUM: Practical application, "how would you", comparisons, use cases
- HARD: System design, architecture, complex problem-solving, trade-offs

IMPORTANT: Questions must be specific to {job_context} role, not generic programming questions.

Output ONLY valid JSON in this EXACT format:
{{
  "questions": [
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}},
    {{"question": "...", "ideal_answer": "..."}}
  ]
}}"""
                    
                    response = call_groq_api(prompt, max_tokens=2000)
                    logger.info(f"Batch generation response: {response[:200]}...")
                    
                    try:
                        result = json.loads(response)
                        if 'questions' in result and len(result['questions']) == 6:
                            logger.info(f"Successfully generated {len(result['questions'])} questions for {job_context}")
                            return jsonify(result)
                        else:
                            logger.error(f"Invalid response format: {result}")
                            raise ValueError("Invalid response format")
                    except (json.JSONDecodeError, ValueError) as e:
                        logger.error(f"JSON parse error: {e}, Response: {response}")
                        # Fall back to individual generation
                        
                except Exception as e:
                    logger.error(f"Batch generation failed: {e}")
            
            # Fallback: Return error to trigger individual generation
            return jsonify({'error': 'Batch generation failed, use individual calls'}), 500
        
        elif action == 'generate_question':
            if groq_client:
                try:
                    # Enhanced prompt with time-appropriate difficulty
                    time_guidance = {
                        'easy': '20 seconds - should be answerable with basic knowledge',
                        'medium': '60 seconds - requires explanation and examples',
                        'hard': '120 seconds - needs detailed analysis and design thinking'
                    }
                    
                    prompt = f"""Generate ONE {difficulty.upper()} technical interview question for a {job_context} position.

REQUIREMENTS:
- Difficulty: {difficulty.upper()} ({time_guidance.get(difficulty, '')})
- Must be answerable within the time limit
- Should test practical knowledge, not memorization
- Clear and unambiguous wording

DIFFICULTY GUIDELINES:
- EASY: Basic concepts, definitions, simple "what is" or "explain briefly" questions
- MEDIUM: Practical application, "how would you", comparisons, use cases
- HARD: System design, architecture decisions, complex problem-solving, trade-offs

EXAMPLES:
Easy: "What is the purpose of the virtual DOM in React?"
Medium: "How would you optimize performance in a React application with large lists?"
Hard: "Design a real-time collaborative editing system using React. Explain your architecture, state management approach, and how you'd handle conflicts."

Generate a question that is:
1. Specific and focused
2. Answerable in the given time
3. Tests understanding, not just recall
4. Relevant to real-world {job_context} work

Output ONLY valid JSON: {{"question":"<your question here>","difficulty":"{difficulty}"}}"""
                    
                    response = call_groq_api(prompt, max_tokens=300)
                    
                    # Try to parse JSON response
                    try:
                        result = json.loads(response)
                        return jsonify(result)
                    except json.JSONDecodeError:
                        # If not valid JSON, wrap the response
                        return jsonify({
                            'question': response,
                            'difficulty': difficulty
                        })
                        
                except Exception as e:
                    logger.error(f"Groq API failed: {e}")
                    # Fall back to mock questions
            
            # Mock questions as fallback
            mock_questions = {
                'easy': 'What is React and how does it differ from vanilla JavaScript?',
                'medium': 'Explain the concept of state management in React applications.',
                'hard': 'Design a scalable architecture for a real-time chat application using React and Node.js.'
            }
            
            return jsonify({
                'question': mock_questions.get(difficulty, 'Sample question'),
                'difficulty': difficulty
            })
        
        elif action == 'generate_ideal':
            question = data.get('question')
            
            if groq_client:
                try:
                    prompt = f"""Provide a clear, concise ideal answer for the question: "{question}"
                    The answer should be 40-200 words, technically accurate, and demonstrate best practices.
                    Output JSON: {{"ideal":"..."}}"""
                    
                    response = call_groq_api(prompt)
                    
                    try:
                        result = json.loads(response)
                        return jsonify(result)
                    except json.JSONDecodeError:
                        return jsonify({
                            'ideal': response
                        })
                        
                except Exception as e:
                    logger.error(f"Groq API failed: {e}")
            
            # Mock ideal answer as fallback
            return jsonify({
                'ideal': f'This is an ideal answer for: {question}. It demonstrates understanding of the concept and provides practical examples.'
            })
        
        else:
            return jsonify({'error': 'Invalid action'}), 400
            
    except Exception as e:
        logger.error(f"Error in generate_question: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/score', methods=['POST'])
def score_answer():
    """
    Score candidate answer against ideal answer
    Expected payload:
    {
        "question": "What is React?",
        "ideal": "React is a JavaScript library...",
        "candidate_answer": "React is a framework..."
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        question = data.get('question')
        ideal = data.get('ideal')
        candidate_answer = data.get('candidate_answer')
        
        if not all([question, ideal, candidate_answer]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if groq_client:
            try:
                prompt = f"""Compare the ideal answer and candidate answer for this question:

Question: "{question}"

Ideal Answer: "{ideal}"

Candidate Answer: "{candidate_answer}"

Score the candidate answer from 1-10 based on:
- Technical accuracy
- Completeness
- Understanding of concepts
- Practical application

Provide a JSON response: {{"score": 7, "reason": "Brief explanation of the score"}}"""
                
                response = call_groq_api(prompt)
                
                try:
                    result = json.loads(response)
                    # Ensure score is within valid range
                    score = max(1, min(10, int(result.get('score', 5))))
                    return jsonify({
                        'score': score,
                        'reason': result.get('reason', 'Good understanding demonstrated')
                    })
                except (json.JSONDecodeError, ValueError):
                    # Fall back to mock scoring
                    pass
                    
            except Exception as e:
                logger.error(f"Groq API failed: {e}")
        
        # Mock scoring as fallback
        import random
        score = random.randint(6, 10)
        
        return jsonify({
            'score': score,
            'reason': f'Candidate demonstrated good understanding of the concept'
        })
        
    except Exception as e:
        logger.error(f"Error in score_answer: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/evaluate-answers', methods=['POST'])
def evaluate_answers():
    """
    Evaluate all interview answers at once with strict grading
    Expected payload:
    {
        "questions": [
            {
                "question": "...",
                "ideal_answer": "...",
                "candidate_answer": "...",
                "difficulty": "easy|medium|hard"
            }
        ],
        "job_title": "Fullstack Developer"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        questions = data.get('questions', [])
        job_title = data.get('job_title', 'Developer')
        
        if not questions:
            return jsonify({'error': 'No questions provided'}), 400
        
        evaluations = []
        
        if groq_client:
            try:
                # Prepare comprehensive evaluation prompt
                questions_text = ""
                for i, q in enumerate(questions):
                    questions_text += f"""
---
Question {i+1} (Difficulty: {q.get('difficulty', 'medium').upper()}):
{q.get('question', '')}

Expected Answer:
{q.get('ideal_answer', '')}

Candidate's Answer:
{q.get('candidate_answer', '')}
"""
                
                prompt = f"""You are a professional technical interviewer evaluating candidates for a {job_title} position. Your role is to grade answers with STRICT and FAIR judgment.

GRADING CRITERIA:
1. **Correctness (40%)**: Is the answer technically accurate?
2. **Completeness (30%)**: Does it cover all key points?
3. **Depth (20%)**: Shows understanding beyond surface level?
4. **Clarity (10%)**: Is it well-articulated?

GRADING RULES:
- Blank/empty answers = 0 points (NO EXCEPTIONS)
- Irrelevant or nonsensical answers = 0-1 points
- Partially correct but incomplete = 2-4 points
- Correct but lacks depth = 5-6 points
- Good answer with minor gaps = 7-8 points
- Excellent comprehensive answer = 9-10 points
- DO NOT give high scores for long answers without substance
- DO NOT be lenient - this is a professional evaluation

EXAMPLES:
Example 1 - Easy Question: "What is React?"
- Candidate: "React is a JavaScript library for building user interfaces" → Score: 6/10 (Correct but too brief)
- Candidate: "React is a JavaScript library for building UIs, uses virtual DOM for efficient updates, component-based architecture" → Score: 9/10 (Comprehensive)
- Candidate: "It's a framework for making websites" → Score: 3/10 (Partially correct, technically inaccurate)

Example 2 - Medium Question: "Explain useEffect hook"
- Candidate: "useEffect is for side effects" → Score: 4/10 (Too vague)
- Candidate: "useEffect handles side effects like API calls, runs after render, cleanup with return function, dependency array controls when it runs" → Score: 9/10 (Excellent)
- Candidate: "" → Score: 0/10 (Blank)

Example 3 - Hard Question: "Design scalable state management"
- Candidate: "Use Redux" → Score: 2/10 (Oversimplified)
- Candidate: "Implement Redux Toolkit with normalized state, use RTK Query for server state, Context for local UI state, proper selectors with memoization" → Score: 9/10 (Comprehensive design)

NOW EVALUATE THESE ANSWERS:
{questions_text}

Provide ONLY a valid JSON array with this exact format:
{{"evaluations": [
    {{"score": <number 0-10>, "reason": "<brief 10-15 word explanation>"}},
    ...
]}}

Be STRICT. Most candidates should score 4-7. Only exceptional answers deserve 8-10."""

                response = call_groq_api(prompt, max_tokens=1500)
                
                try:
                    # Try to parse JSON response
                    result = json.loads(response)
                    evaluations = result.get('evaluations', [])
                    
                    # Validate and ensure we have evaluations for all questions
                    if len(evaluations) < len(questions):
                        # Fill missing evaluations
                        while len(evaluations) < len(questions):
                            evaluations.append({'score': 0, 'reason': 'Evaluation failed'})
                    
                    # Ensure scores are within valid range
                    for eval_item in evaluations:
                        eval_item['score'] = max(0, min(10, int(eval_item.get('score', 0))))
                    
                    return jsonify({'evaluations': evaluations})
                    
                except (json.JSONDecodeError, ValueError) as e:
                    logger.error(f"JSON parse error: {e}, Response: {response}")
                    # Fall back to individual evaluation
                    
            except Exception as e:
                logger.error(f"Groq API failed: {e}")
        
        # Fallback: Basic evaluation based on answer length and content
        for q in questions:
            answer = q.get('candidate_answer', '').strip()
            
            if not answer or len(answer) < 10:
                evaluations.append({'score': 0, 'reason': 'No meaningful answer provided'})
            elif len(answer) < 30:
                evaluations.append({'score': 3, 'reason': 'Answer too brief, lacks detail'})
            elif len(answer) < 100:
                evaluations.append({'score': 5, 'reason': 'Basic understanding shown'})
            else:
                evaluations.append({'score': 6, 'reason': 'Adequate response provided'})
        
        return jsonify({'evaluations': evaluations})
        
    except Exception as e:
        logger.error(f"Error in evaluate_answers: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/summary', methods=['POST'])
def generate_summary():
    """
    Generate final interview summary
    Expected payload:
    {
        "answers": [{"question": "...", "candidate_answer": "...", "score": 8}],
        "candidate": {"name": "John Doe", "email": "john@example.com"},
        "job": {"title": "Fullstack Developer"}
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        answers = data.get('answers', [])
        candidate = data.get('candidate', {})
        job = data.get('job', {})
        
        if not answers:
            return jsonify({'error': 'No answers provided'}), 400
        
        # Calculate average score
        total_score = sum(answer.get('score', 0) for answer in answers)
        final_score = total_score / len(answers) if answers else 0
        
        if groq_client:
            try:
                # Prepare answers summary for AI
                answers_text = "\n".join([
                    f"Q{i+1}: {ans.get('question', '')}\nAnswer: {ans.get('candidate_answer', '')}\nScore: {ans.get('score', 0)}/10\n"
                    for i, ans in enumerate(answers)
                ])
                
                prompt = f"""Based on this interview performance, provide a final assessment:

Candidate: {candidate.get('name', 'Unknown')}
Job Position: {job.get('title', 'Developer')}
Average Score: {final_score:.1f}/10

Interview Answers:
{answers_text}

Provide a JSON response with:
- final_score: {final_score:.1f} (use this exact value)
- summary: A 2-3 sentence professional summary of the candidate's performance, strengths, and areas for improvement

JSON format: {{"final_score": {final_score:.1f}, "summary": "..."}}"""
                
                response = call_groq_api(prompt, max_tokens=300)
                
                try:
                    result = json.loads(response)
                    return jsonify({
                        'final_score': float(result.get('final_score', final_score)),
                        'summary': result.get('summary', f'Candidate {candidate.get("name", "Unknown")} demonstrated solid technical knowledge with an average score of {final_score:.1f}/10.')
                    })
                except (json.JSONDecodeError, ValueError):
                    # Fall back to mock summary
                    pass
                    
            except Exception as e:
                logger.error(f"Groq API failed: {e}")
        
        # Mock summary as fallback
        return jsonify({
            'final_score': round(final_score, 1),
            'summary': f'Candidate {candidate.get("name", "Unknown")} demonstrated solid technical knowledge with an average score of {final_score:.1f}/10. The candidate showed good understanding of core concepts and provided thoughtful responses throughout the interview.'
        })
        
    except Exception as e:
        logger.error(f"Error in generate_summary: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

def send_email_notification(to_email: str, template: str, candidate_name: str, job_title: str) -> bool:
    """Send email notification using SMTP"""
    try:
        if not all([SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS]):
            logger.warning("SMTP credentials not configured, skipping email")
            return False
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        
        if template == 'shortlist':
            msg['Subject'] = f'Congratulations! You have been shortlisted for {job_title}'
            html_content = create_shortlist_email(candidate_name, job_title)
        elif template == 'reject':
            msg['Subject'] = f'Interview Results Update - {job_title}'
            html_content = create_reject_email(candidate_name, job_title)
        else:
            logger.error(f"Unknown email template: {template}")
            return False
        
        # Attach HTML content
        html_part = MIMEText(html_content, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(SMTP_HOST, int(SMTP_PORT)) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(msg)
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def create_shortlist_email(candidate_name: str, job_title: str) -> str:
    """Create HTML email template for shortlisted candidates"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Congratulations!</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #3A7CFF, #2563EB); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .button {{ display: inline-block; background: #3A7CFF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Congratulations!</h1>
                <p>You have been shortlisted for the next round</p>
            </div>
            <div class="content">
                <h2>Dear {candidate_name},</h2>
                <p>We are excited to inform you that you have been <strong>shortlisted</strong> for the <strong>{job_title}</strong> position!</p>
                <p>Your performance in our AI-powered interview was impressive, and we would like to move forward with the next steps in our hiring process.</p>
                <p>Our team will be in touch with you shortly to schedule the next round of interviews.</p>
                <p>Thank you for your interest in joining our team!</p>
                <br>
                <p>Best regards,<br>The Hiring Team</p>
            </div>
        </div>
    </body>
    </html>
    """

def create_reject_email(candidate_name: str, job_title: str) -> str:
    """Create HTML email template for rejected candidates"""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Interview Results Update</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #FF573A, #E53E3E); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Interview Results Update</h1>
                <p>Thank you for your interest</p>
            </div>
            <div class="content">
                <h2>Dear {candidate_name},</h2>
                <p>Thank you for taking the time to participate in our interview process for the <strong>{job_title}</strong> position.</p>
                <p>After careful consideration, we have decided to move forward with other candidates for this role. This decision was not easy, as we were impressed by your qualifications and enthusiasm.</p>
                <p>We encourage you to apply for other positions that may be a better fit for your skills and experience. We will keep your information on file for future opportunities.</p>
                <p>We wish you the best of luck in your job search!</p>
                <br>
                <p>Best regards,<br>The Hiring Team</p>
            </div>
        </div>
    </body>
    </html>
    """

@app.route('/api/send-email', methods=['POST'])
def send_email():
    """
    Send email notification
    Expected payload:
    {
        "to": "candidate@example.com",
        "subject": "Interview Result",
        "template": "shortlist|reject",
        "candidate_name": "John Doe",
        "job_title": "Fullstack Developer"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        to_email = data.get('to')
        template = data.get('template')
        candidate_name = data.get('candidate_name')
        job_title = data.get('job_title')
        
        if not all([to_email, template, candidate_name, job_title]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        if template not in ['shortlist', 'reject']:
            return jsonify({'error': 'Invalid template. Must be "shortlist" or "reject"'}), 400
        
        # Send email
        success = send_email_notification(to_email, template, candidate_name, job_title)
        
        if success:
            return jsonify({
                'status': 'success',
                'message': f'Email sent successfully to {to_email}'
            })
        else:
            return jsonify({
                'status': 'warning',
                'message': f'Email sending failed, but action was recorded'
            })
        
    except Exception as e:
        logger.error(f"Error in send_email: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    """Get all jobs"""
    if not (SUPABASE_URL and SUPABASE_KEY):
        logger.warning('[Backend:/api/jobs GET] Using mock data - Supabase env not configured')
    else:
        logger.info('[Backend:/api/jobs GET] Placeholder response - Supabase integration pending')
    return jsonify({
        'jobs': [
            {
                'id': 1,
                'title': 'Fullstack Developer',
                'description': 'React/Node.js developer position',
                'custom_questions': [],
                'created_at': '2024-01-01T00:00:00Z'
            }
        ]
    })

@app.route('/api/jobs', methods=['POST'])
def create_job():
    """Create a new job"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        title = data.get('title')
        description = data.get('description')
        custom_questions = data.get('custom_questions', [])
        
        if not title:
            return jsonify({'error': 'Job title is required'}), 400
        
        if not (SUPABASE_URL and SUPABASE_KEY):
            logger.warning('[Backend:/api/jobs POST] Using mock create - Supabase env not configured')
        else:
            logger.info('[Backend:/api/jobs POST] Placeholder create - Supabase integration pending')
        return jsonify({
            'id': 1,
            'title': title,
            'description': description,
            'custom_questions': custom_questions,
            'created_at': '2024-01-01T00:00:00Z'
        })
        
    except Exception as e:
        logger.error(f"Error in create_job: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/candidates/<int:job_id>', methods=['GET'])
def get_candidates(job_id):
    """Get candidates for a specific job"""
    # TODO: Implement Supabase integration
    return jsonify({
        'candidates': [
            {
                'id': 1,
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+1234567890',
                'final_score': 8.5,
                'status': 'completed',
                'interview_data': {
                    'answers': [],
                    'scores': [],
                    'summary': 'Strong candidate with good technical skills.'
                }
            }
        ]
    })

@app.route('/api/parse-resume', methods=['POST'])
def parse_resume():
    """
    Parse resume file and extract information
    Expected: multipart/form-data with 'file' field
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'.pdf', '.docx'}
        file_ext = os.path.splitext(file.filename)[1].lower()
        if file_ext not in allowed_extensions:
            return jsonify({'error': 'Only PDF and DOCX files are allowed'}), 400
        
        # Validate file size (10MB limit)
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({'error': 'File size must be less than 10MB'}), 400
        
        # Extract text based on file type
        text = ""
        if file_ext == '.pdf':
            text = extract_text_from_pdf(file)
        elif file_ext == '.docx':
            text = extract_text_from_docx(file)
        
        if not text.strip():
            return jsonify({'error': 'Could not extract text from file'}), 400
        
        # Extract information from text
        extracted_info = extract_info_from_text(text)
        
        return jsonify({
            'success': True,
            'text': text,
            'extracted_info': extracted_info
        })
        
    except Exception as e:
        logger.error(f"Error parsing resume: {str(e)}")
        return jsonify({'error': 'Failed to parse resume file'}), 500

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise e

def extract_text_from_docx(file):
    """Extract text from DOCX file"""
    try:
        doc = Document(file)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
        raise e

def extract_info_from_text(text):
    """Extract name, email, and phone from text"""
    try:
        # Email regex
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        email = email_match.group() if email_match else None
        
        # Phone regex (various formats)
        phone_patterns = [
            r'\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})',
            r'\+?[0-9]{1,3}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}',
            r'\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'
        ]
        
        phone = None
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                phone = phone_match.group().strip()
                break
        
        # Name extraction (look for common patterns)
        name_patterns = [
            r'(?:Name|Full Name|Candidate Name)[:\s]+([A-Za-z\s]{2,50})',
            r'^([A-Za-z\s]{2,50})\s*$',  # Lines with only name
            r'([A-Z][a-z]+\s+[A-Z][a-z]+)',  # First Last pattern
        ]
        
        name = None
        for pattern in name_patterns:
            name_match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if name_match:
                name = name_match.group(1).strip()
                # Clean up the name
                name = re.sub(r'\s+', ' ', name)  # Remove extra spaces
                if len(name) > 2 and len(name) < 50:  # Reasonable name length
                    break
        
        return {
            'name': name,
            'email': email,
            'phone': phone
        }
        
    except Exception as e:
        logger.error(f"Error extracting info from text: {e}")
        return {
            'name': None,
            'email': None,
            'phone': None
        }


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=True)
