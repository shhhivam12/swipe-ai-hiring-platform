# 🚀 Complete Setup Guide for Beginners

This guide will help you set up and run the Swipe AI Interview Portal from scratch, even if you're new to React and Python.

## 📋 Prerequisites

Before starting, make sure you have these installed on your computer:

### 1. Node.js and npm
- **Download**: Go to [nodejs.org](https://nodejs.org/)
- **Install**: Download the LTS version (recommended for most users)
- **Verify**: Open Command Prompt/Terminal and run:
  ```bash
  node --version
  npm --version
  ```
  You should see version numbers (e.g., v18.17.0 and 9.6.7)

### 2. Python
- **Download**: Go to [python.org](https://www.python.org/downloads/)
- **Install**: Download Python 3.8 or newer
- **Important**: During installation, check "Add Python to PATH"
- **Verify**: Open Command Prompt/Terminal and run:
  ```bash
  python --version
  pip --version
  ```
  You should see version numbers (e.g., Python 3.11.0)

### 3. Git (Optional but recommended)
- **Download**: Go to [git-scm.com](https://git-scm.com/)
- **Install**: Use default settings
- **Verify**: Run `git --version`

## 🛠️ Step-by-Step Setup

### Step 1: Open Terminal/Command Prompt

**Windows Users:**
- Press `Win + R`, type `cmd`, press Enter
- Or search "Command Prompt" in Start menu

**Mac Users:**
- Press `Cmd + Space`, type "Terminal", press Enter

**Linux Users:**
- Press `Ctrl + Alt + T`

### Step 2: Navigate to Your Project Folder

```bash
# Navigate to your project directory
cd "C:\Users\lenovo\OneDrive - Graphic Era University\Desktop\swipe hiring platform"
```

### Step 3: Install Frontend Dependencies

```bash
# Install all React dependencies
npm install
```

**What this does:** Downloads all the JavaScript libraries needed for the React frontend.

**Expected output:** You'll see a lot of text scrolling, ending with something like:
```
added 1234 packages, and audited 1235 packages in 2m
found 0 vulnerabilities
```

### Step 4: Install Backend Dependencies

```bash
# Navigate to backend folder
cd backend

# Install Python dependencies
pip install -r requirements.txt
```

**What this does:** Downloads all the Python libraries needed for the Flask backend.

**Expected output:** You'll see packages being installed, ending with:
```
Successfully installed Flask-2.3.3 Flask-CORS-4.0.0 ...
```

### Step 5: Go Back to Main Directory

```bash
# Go back to the main project folder
cd ..
```

## 🔧 Configuration

### Step 6: Create Environment File

1. **Copy the example file:**
   ```bash
   copy env.example .env
   ```
   (On Mac/Linux: `cp env.example .env`)

2. **Edit the .env file** with a text editor (Notepad, VS Code, etc.):
   ```env
   # For now, you can leave these as placeholders
   GROQ_API_KEY=your_groq_api_key_here
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   FLASK_SECRET=your_flask_secret_key
   FLASK_ENV=development
   PORT=5000
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_KEY=your_supabase_anon_key
   REACT_APP_API_BASE=http://localhost:5000/api
   ```

## 🚀 Running the Application

### Step 7: Start the Backend Server

**Open a new terminal/command prompt window** and run:

```bash
# Navigate to your project
cd "C:\Users\lenovo\OneDrive - Graphic Era University\Desktop\swipe hiring platform"

# Go to backend folder
cd backend

# Start the Flask server
python app.py
```

**Expected output:**
```
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://[your-ip]:5000
```

**Keep this terminal open** - the backend server needs to keep running.

### Step 8: Start the Frontend Server

**Open another new terminal/command prompt window** and run:

```bash
# Navigate to your project
cd "C:\Users\lenovo\OneDrive - Graphic Era University\Desktop\swipe hiring platform"

# Start the React development server
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view swipe-ai-interview-portal in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

**Your browser should automatically open** to `http://localhost:3000`

## ✅ Testing the Application

### Step 9: Verify Everything Works

1. **Check the website:** You should see the Swipe AI landing page
2. **Test role selection:** Click "Login" and select "Login as Student" or "Login as Interviewer"
3. **Test navigation:** You should be able to switch between different pages
4. **Test backend:** The backend should be running on `http://localhost:5000`

### Step 10: Test Backend API

Open a new browser tab and go to: `http://localhost:5000/api/health`

You should see:
```json
{
  "status": "healthy",
  "message": "Swipe AI Interview Portal API is running"
}
```

## 🐛 Troubleshooting

### Common Issues and Solutions

#### Issue 1: "npm is not recognized"
**Solution:** Node.js is not installed or not in PATH
- Reinstall Node.js from [nodejs.org](https://nodejs.org/)
- Make sure to check "Add to PATH" during installation

#### Issue 2: "python is not recognized"
**Solution:** Python is not installed or not in PATH
- Reinstall Python from [python.org](https://www.python.org/downloads/)
- Make sure to check "Add Python to PATH" during installation

#### Issue 3: "Port 3000 is already in use"
**Solution:** Another application is using port 3000
- Close other applications that might be using port 3000
- Or press `Ctrl + C` in the terminal and run `npm start` again

#### Issue 4: "Port 5000 is already in use"
**Solution:** Another application is using port 5000
- Close other applications that might be using port 5000
- Or change the port in the .env file

#### Issue 5: "Module not found" errors
**Solution:** Dependencies not installed properly
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Issue 6: "Permission denied" errors
**Solution:** Run terminal as administrator (Windows) or use sudo (Mac/Linux)

## 📱 What You Should See

### Landing Page
- Welcome message: "Welcome to Swipe AI Interview Portal"
- Two cards: "Student" and "Interviewer"
- Clean, modern design with blue and orange colors

### Student Page (after clicking "Login as Student")
- Student dashboard with resume upload section
- Interview process explanation
- Placeholder content for Phase 1

### Interviewer Page (after clicking "Login as Interviewer")
- Interviewer dashboard with job management
- Candidate listing table
- Placeholder content for Phase 1

## 🎯 Next Steps

Once everything is running successfully:

1. **Phase 1 is complete!** ✅
2. You can explore the interface and test the role switching
3. The backend API endpoints are ready for Phase 2 development
4. All the foundation is set for adding the interview functionality

## 📞 Getting Help

If you encounter any issues:

1. **Check the terminal output** for error messages
2. **Make sure both servers are running** (backend on port 5000, frontend on port 3000)
3. **Verify all dependencies are installed** by running the install commands again
4. **Check that your .env file exists** and has the correct format

## 🎉 Success!

If you can see the Swipe AI landing page in your browser and the backend health check returns a success message, congratulations! You've successfully set up Phase 1 of the Swipe AI Interview Portal.

The application is now ready for Phase 2 development, where we'll add the actual interview functionality, resume upload, and AI-powered question generation.
