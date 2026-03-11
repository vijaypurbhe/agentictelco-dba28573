

## Problem

Your project root has no `firebase.json` or `.firebaserc` file. Firebase Hosting requires `firebase.json` to know which folder to deploy. Without it, it serves the default welcome page.

## Plan

Add two files to the project root:

### 1. `firebase.json`
Configure Firebase Hosting to serve from `dist/` with SPA rewrites:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

### 2. `.firebaserc`
Link to your Firebase project (you'll need to replace the project ID with your actual one):
```json
{
  "projects": {
    "default": "YOUR_FIREBASE_PROJECT_ID"
  }
}
```

### After implementation

Run from the project root:
```bash
npm run build
firebase deploy --only hosting
```

