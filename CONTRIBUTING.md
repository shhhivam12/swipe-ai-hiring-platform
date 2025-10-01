# 🤝 Contributing to SwipeHiring

First off, thank you for considering contributing to SwipeHiring! It's people like you that make SwipeHiring such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

### Our Standards

- ✅ Be respectful and inclusive
- ✅ Welcome newcomers and encourage diverse perspectives
- ✅ Focus on what is best for the community
- ✅ Show empathy towards other community members
- ❌ No harassment, trolling, or discriminatory language

---

## 🎯 How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (OS, browser, versions)

**Bug Report Template:**

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. Windows 11]
 - Browser: [e.g. Chrome 120]
 - Version: [e.g. 1.0.0]
```

### ✨ Suggesting Features

Feature requests are welcome! Please provide:

- **Clear use case**
- **Expected behavior**
- **Why this feature would be useful**
- **Possible implementation** (optional)

### 💻 Code Contributions

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

---

## 🛠️ Development Setup

### Prerequisites

```bash
Node.js >= 16.x
Python >= 3.8
npm or yarn
Git
```

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/swipe-hiring-platform.git
cd swipe-hiring-platform

# 2. Install dependencies
npm install
cd backend && pip install -r requirements.txt && cd ..

# 3. Set up environment variables
cp env.example .env
# Edit .env with your credentials

# 4. Start development servers
npm start  # Frontend (Terminal 1)
cd backend && python app.py  # Backend (Terminal 2)
```

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Commits are clean and descriptive

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe tests performed

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Commented complex code
- [ ] Updated documentation
- [ ] No new warnings
- [ ] Tests pass
```

### Review Process

1. **Submit PR** with clear description
2. **Automated checks** must pass
3. **Code review** by maintainers
4. **Address feedback** if any
5. **Merge** once approved

---

## 📝 Coding Standards

### TypeScript/React

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
}

const UserCard: React.FC<UserProps> = ({ name, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

// ❌ Bad
const UserCard = (props) => {
  return <div><h3>{props.name}</h3><p>{props.email}</p></div>
}
```

### Python/Flask

```python
# ✅ Good
def calculate_score(answers: List[str]) -> float:
    """
    Calculate interview score based on answers.
    
    Args:
        answers: List of candidate answers
        
    Returns:
        float: Score between 0 and 100
    """
    total_score = 0
    for answer in answers:
        total_score += evaluate_answer(answer)
    return total_score / len(answers)

# ❌ Bad
def calc(a):
    s=0
    for x in a:s+=eval(x)
    return s/len(a)
```

### General Guidelines

- **Naming**: Use descriptive names
- **Functions**: Keep them small and focused
- **Comments**: Explain why, not what
- **Formatting**: Use Prettier/Black
- **Imports**: Organize and remove unused
- **Types**: Use TypeScript types properly

---

## 💬 Commit Messages

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Examples

```bash
# ✅ Good
feat(interview): add pause/resume TTS functionality

Added buttons to pause and resume TTS narration during interviews.
Users can now control the pace of question reading.

Closes #123

# ✅ Good
fix(auth): resolve login redirect issue

Fixed bug where users were not redirected after successful login.
Updated redirect logic in AuthService.

Fixes #456

# ❌ Bad
fixed stuff
update code
changes
```

---

## 🧪 Testing

### Running Tests

```bash
# Frontend
npm test
npm run test:coverage

# Backend
cd backend
python -m pytest
python -m pytest --cov
```

### Writing Tests

```typescript
// Example test
describe('UserCard', () => {
  it('renders user name and email', () => {
    const { getByText } = render(
      <UserCard name="John Doe" email="john@example.com" />
    );
    
    expect(getByText('John Doe')).toBeInTheDocument();
    expect(getByText('john@example.com')).toBeInTheDocument();
  });
});
```

---

## 📚 Documentation

### Code Documentation

```typescript
/**
 * Generates interview questions based on job role and resume.
 * 
 * @param jobRole - The job position
 * @param resume - Parsed resume data
 * @param difficulty - Question difficulty level (1-5)
 * @returns Array of generated questions
 * 
 * @example
 * ```typescript
 * const questions = await generateQuestions(
 *   'Software Engineer',
 *   resumeData,
 *   3
 * );
 * ```
 */
async function generateQuestions(
  jobRole: string,
  resume: ResumeData,
  difficulty: number
): Promise<Question[]> {
  // Implementation
}
```

### README Updates

When adding features, update:
- Feature list
- Screenshots (if UI changed)
- Configuration (if new env vars)
- Installation steps (if dependencies added)

---

## 🎨 Style Guide

### Component Structure

```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { theme } from '../styles/theme';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

// 3. Component
const MyComponent: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  // 4. State
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 6. Handlers
  const handleClick = () => {
    setIsLoading(true);
    onSubmit();
  };
  
  // 7. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick} loading={isLoading}>
        Submit
      </Button>
    </div>
  );
};

// 8. Export
export default MyComponent;
```

### CSS/Styling

```css
/* Use BEM naming */
.interview-card {
  padding: 20px;
}

.interview-card__header {
  font-size: 24px;
}

.interview-card__header--active {
  color: #2754ff;
}

/* Use CSS variables */
:root {
  --primary-color: #2754ff;
  --spacing-md: 20px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing-md);
}
```

---

## 🏷️ Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature or request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `question` | Further information requested |
| `wontfix` | This will not be worked on |

---

## 🎯 Priority Levels

- **P0 - Critical**: Blocks core functionality
- **P1 - High**: Important feature/fix
- **P2 - Medium**: Nice to have
- **P3 - Low**: Minor improvement

---

## 🚀 Release Process

1. **Version bump** in package.json
2. **Update CHANGELOG.md**
3. **Create release branch**
4. **Run full test suite**
5. **Create GitHub release**
6. **Deploy to production**

---

## 📞 Getting Help

- 💬 **Discussions**: GitHub Discussions
- 🐛 **Issues**: GitHub Issues
- 📧 **Email**: your.email@example.com
- 💼 **LinkedIn**: [Shivam Mahendru](https://www.linkedin.com/in/shivam-mahendru-5b212b203)

---

## 🙏 Thank You!

Your contributions make SwipeHiring better for everyone. We appreciate your time and effort!

### Top Contributors

<!-- Add contributor images here -->

---

**Happy Contributing! 🎉**

Made with ❤️ by the SwipeHiring community
