# Contributing to TravelPlanner

Thank you for your interest in contributing to TravelPlanner! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git
- A Supabase account (for backend features)
- An OpenAI API key (for AI features, optional)

### Development Setup

1. **Fork and clone the repository**
```bash
git clone https://github.com/yourusername/travel-planner.git
cd travel-planner
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Fill in your environment variables
```

4. **Start development server**
```bash
npm run dev
```

## 📋 Development Guidelines

### Code Style
- Use TypeScript for all new code
- Follow the existing code style and formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Component Structure
```typescript
// Component imports
import React, { useState, useEffect } from 'react';
import { ComponentProps } from './types';

// External library imports
import { ExternalLibrary } from 'external-library';

// Internal imports
import { internalFunction } from '../utils';
import './Component.css';

interface ComponentProps {
  // Define props with TypeScript
}

export default function Component({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### File Organization
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── trips/          # Trip-related components
│   └── auth/           # Authentication components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected vs actual behavior**
4. **Environment details** (OS, browser, version)
5. **Screenshots** if applicable
6. **Console errors** if any

## ✨ Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** you're trying to solve
3. **Propose a solution** with details
4. **Consider the impact** on existing functionality
5. **Be open to discussion** and feedback

## 🔧 Pull Request Process

### Before Submitting
- [ ] Test your changes thoroughly
- [ ] Update documentation if needed
- [ ] Add/update tests for new functionality
- [ ] Ensure all tests pass
- [ ] Follow the code style guidelines

### PR Guidelines
1. **Create a feature branch** from `main`
2. **Use descriptive commit messages**
3. **Keep PRs focused** on a single feature/fix
4. **Update the PR description** with details
5. **Link related issues** using keywords

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(trips): add AI-powered activity suggestions`
- `fix(budget): resolve expense category calculation bug`
- `docs(readme): update installation instructions`

## 🧪 Testing

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Writing Tests
- Write tests for new features and bug fixes
- Use descriptive test names
- Test both happy path and edge cases
- Mock external dependencies

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for functions and classes
- Document complex algorithms and business logic
- Keep README and other docs up to date

### API Documentation
- Document new API endpoints
- Include request/response examples
- Update OpenAPI/Swagger specs if applicable

## 🎨 Design Guidelines

### UI/UX Principles
- **Consistency** - Follow existing design patterns
- **Accessibility** - Ensure WCAG compliance
- **Responsiveness** - Support all device sizes
- **Performance** - Optimize for speed and efficiency

### Design System
- Use Tailwind CSS utility classes
- Follow the established color palette
- Maintain consistent spacing and typography
- Use Heroicons for iconography

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality
- **PATCH** version for backwards-compatible bug fixes

### Release Checklist
- [ ] Update version in `package.json`
- [ ] Update CHANGELOG.md
- [ ] Create release notes
- [ ] Tag the release
- [ ] Deploy to production

## 🤝 Community

### Communication
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** - Real-time chat and community support

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

## 📞 Getting Help

If you need help:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Ask in GitHub Discussions** for general questions
4. **Create an issue** for bugs or specific problems
5. **Join our Discord** for real-time help

## 🙏 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes for significant contributions
- Invited to join the core team for outstanding contributions

Thank you for contributing to TravelPlanner! 🌍✈️