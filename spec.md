# Colour Number Big Small AI Hack

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A fun, interactive game/hack where the player sees a **color name displayed in a different ink color** (classic Stroop effect twist)
- Player must identify whether the displayed number is **Big or Small** relative to a threshold (e.g., 50 out of 1–100)
- An **AI-driven twist**: numbers and colors change dynamically, difficulty scales over time
- Score tracking (correct/incorrect answers, streak, timer)
- Round-based gameplay with increasing speed pressure
- Visual feedback for correct/wrong answers
- Game states: start screen, playing, game over

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend: Store high scores per session (optional, can be frontend-only)
2. Frontend:
   - Start screen with game title and rules
   - Game screen: displays a large colored number, two buttons (Big / Small)
   - Timer countdown per round (starts generous, speeds up)
   - Score and streak counter
   - AI twist: use randomized difficulty curves and color-number mismatch confusion
   - Game over screen with final score and restart
   - Smooth animations and transitions
