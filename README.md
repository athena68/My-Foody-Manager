I'll guide you through the process of pushing your code to GitHub:

1. First, if you haven't already, initialize a git repository in your project folder:


```shellscript
# Navigate to your project directory
cd your-project-directory

# Initialize git repository
git init
```

2. Create a new repository on GitHub:

1. Go to github.com and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name your repository (e.g., "coffee-shop-manager")
5. Leave it empty (don't initialize with README, license, or .gitignore)



3. Add your files to git and make your first commit:


```shellscript
# Add all files
git add .

# Create your first commit
git commit -m "Initial commit: Coffee Shop Manager app"
```

4. Connect your local repository to GitHub:


```shellscript
# Add the remote repository URL (replace with your actual GitHub repository URL)
git remote add origin https://github.com/your-username/coffee-shop-manager.git

# Push your code to GitHub
git push -u origin main
```

Note: If your default branch is named "master" instead of "main", use:

```shellscript
git push -u origin master
```

5. For subsequent changes, you can use:


```shellscript
git add .
git commit -m "Your commit message describing the changes"
git push
```

Best Practices:

1. Add a `.gitignore` file to exclude unnecessary files:


```plaintext
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
```

2. Add a README.md file to describe your project:


# Coffee Shop Manager

A web application for managing and tracking your favorite coffee shops and restaurants.

## Features

- 🗺️ Map-based location tracking
- 🏷️ Tag-based organization
- ⭐ Rating system
- 📝 Notes and visit history
- 🌓 Dark/Light mode
- 🔒 User authentication

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- Google Maps API
- shadcn/ui

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/athena68/My-Foody-Manager.git

```
2. Install dependencies:
```bash
npm install
```
3. Create a `.env.local` file in the root directory and add your environment variables:
```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```
4. Run the development server:
```bash
npm run dev
```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.
