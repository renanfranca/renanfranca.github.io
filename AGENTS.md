# Agent Guidelines for Renan's Portfolio

## Build Commands

- `npm install` - Install dependencies
- `npm run build:css` - Build CSS for development
- `npm run build:css:prod` - Build CSS for production
- `npm run build:css:watch` - Watch and build CSS (development)
- `npm run build:css:prod:watch` - Watch and build CSS (production)
- `npm run prettier:check` - Check code formatting
- `npm run prettier:format` - Format code
- `docker compose up` - Start local development server

## Code Style Guidelines

- Use Prettier configuration (140 char width, single quotes, 2 spaces)
- No comments in code unless explicitly requested
- Follow existing naming conventions (camelCase for JS/TS)
- Use `.then()` and `.catch()` instead of await for promises
- Test methods: camelCase starting with "should", pattern: "given + when + when"
- No beforeEach/afterEach in tests
- Avoid mocks, use real cases
- Write like Renan (personal writing style)
- Don't remove existing comments when updating files
- Use TDD approach: write failing test, then implement functionality
