import pytest
import json
import io
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    """Test health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_generate_question(client):
    """Test question generation endpoint"""
    payload = {
        'action': 'generate_question',
        'difficulty': 'easy',
        'job_context': 'Fullstack React/Node'
    }
    
    response = client.post('/api/generate', 
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'question' in data
    assert 'difficulty' in data
    assert data['difficulty'] == 'easy'

def test_score_answer(client):
    """Test answer scoring endpoint"""
    payload = {
        'question': 'What is React?',
        'ideal': 'React is a JavaScript library for building user interfaces.',
        'candidate_answer': 'React is a framework for building web applications.'
    }
    
    response = client.post('/api/score',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'score' in data
    assert 'reason' in data
    assert isinstance(data['score'], int)
    assert 1 <= data['score'] <= 10

def test_generate_summary(client):
    """Test summary generation endpoint"""
    payload = {
        'answers': [
            {'question': 'What is React?', 'candidate_answer': 'A library', 'score': 8},
            {'question': 'What is Node.js?', 'candidate_answer': 'A runtime', 'score': 7}
        ],
        'candidate': {'name': 'John Doe', 'email': 'john@example.com'},
        'job': {'title': 'Fullstack Developer'}
    }
    
    response = client.post('/api/summary',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'final_score' in data
    assert 'summary' in data
    assert isinstance(data['final_score'], (int, float))

def test_send_email(client):
    """Test email sending endpoint"""
    payload = {
        'to': 'test@example.com',
        'subject': 'Interview Result',
        'template': 'shortlist',
        'candidate_name': 'John Doe',
        'job_title': 'Fullstack Developer'
    }
    
    response = client.post('/api/send-email',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'success'

def test_create_job(client):
    """Test job creation endpoint"""
    payload = {
        'title': 'Test Developer',
        'description': 'A test position',
        'custom_questions': ['What is your experience with React?']
    }
    
    response = client.post('/api/jobs',
                          data=json.dumps(payload),
                          content_type='application/json')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['title'] == 'Test Developer'
    assert 'id' in data

def test_get_jobs(client):
    """Test getting all jobs"""
    response = client.get('/api/jobs')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'jobs' in data
    assert isinstance(data['jobs'], list)

def test_get_candidates(client):
    """Test getting candidates for a job"""
    response = client.get('/api/candidates/1')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'candidates' in data
    assert isinstance(data['candidates'], list)

def test_parse_resume_no_file(client):
    """Test parse resume endpoint with no file"""
    response = client.post('/api/parse-resume')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data

def test_parse_resume_invalid_file_type(client):
    """Test parse resume endpoint with invalid file type"""
    data = {'file': (io.BytesIO(b'fake content'), 'test.txt')}
    response = client.post('/api/parse-resume', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'error' in data
