# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/572aeb3d-2fb2-4f5d-aaf2-34c485c03cfa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/572aeb3d-2fb2-4f5d-aaf2-34c485c03cfa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Firebase Setup

### Enable Services in the Console
- Project: `goldfield-8180d`
- Turn on **Authentication** with Email/Password and Google providers.
- Create a **Cloud Firestore** database (production mode, `nam5` region).
- Enable **Cloud Storage** and set the default bucket.
- If you plan to use Cloud Functions, upgrade billing as needed and deploy starter functions.
- Under Authentication → Settings, add local dev origins (e.g. `http://localhost:5173`) to Authorized Domains.

### Bind the Firebase CLI Locally
```sh
npm install -g firebase-tools        # Install CLI if needed
firebase login                       # Authenticate
firebase use goldfield-8180d         # Set the default project
firebase projects:list               # Optional sanity check
```

### Local Development with Emulators
1. Create a local `.env.local` (ignored by git) and add `VITE_USE_FIREBASE_EMULATOR=true` when you want to target emulators.
2. Start the emulators in one terminal:
   ```sh
   firebase emulators:start --project goldfield-8180d --only auth,firestore,functions --import ./.firebase-data --export-on-exit
   ```
   The configuration uses the default ports (Auth `9099`, Firestore `8080`, Functions `5001`) and enables the Emulator UI on `4000`.
3. Run the Vite dev server in a separate terminal with `npm run dev`. When the flag is set the SDK connects to the local emulators automatically.

To deploy the latest rules and indexes after local changes:
```sh
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

### Storage CORS
Uploads from localhost/prod require explicit CORS headers on the Storage bucket. Update `storage-cors.json` (origins already include `localhost:5173`, `localhost:8080`, and the hosted app) and apply it with:
```sh
npx firebase-tools storage:cors:set storage-cors.json --project goldfield-8180d
# or (with gcloud)
gsutil cors set storage-cors.json gs://goldfield-8180d.firebasestorage.app
# rerun this whenever you change cors.json
gsutil cors set storage-cors.json gs://goldfield-8180d.firebasestorage.app
```
Run the command from an authenticated shell (WSL2/macOS/Linux recommended).

### Required Environment Variables
Create a single `.env` file at the project root (the file in the repo is the canonical template). It is loaded by both Vite and the Cloud Functions build.

Frontend (Vite) values:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_USE_FIREBASE_EMULATOR` (optional flag for local emulators)

Functions / shared backend values:
- `LENCO_API_KEY`
- `LENCO_BASE_URL` (optional, defaults to `https://api.lenco.co/access/v2`)
- `CONTACT_RECIPIENT`

### Deployment
```sh
firebase deploy --only hosting:goldfield-zambia-property-gateway
```

### Cloud Functions & Payments
Install function dependencies locally before deploying:
```sh
npm install --prefix functions
```
The functions import the shared `.env` at runtime (see `functions/src/env.ts`), so the same file drives both the frontend and backend. When deploying to Firebase, surface the same variables as standard environment variables or secrets before running `firebase deploy`, e.g. in CI:
```sh
export $(grep -v '^#' .env | xargs)
firebase deploy --only functions
```
Deploy callable and scheduled functions:
```sh
firebase deploy --only functions
```

### Local development loop
- **After every code change inside `functions/src`, rebuild the TypeScript output** so the emulator picks up the latest JavaScript:
  ```sh
  npm --prefix functions run build
  ```
- **To keep rebuilding automatically while you work**, start a watch process in a separate terminal:
  ```sh
  npm --prefix functions run build:watch
  ```
  Leave that running, then launch the emulator (`firebase emulators:start --only functions`) in another terminal. Every saved change in `functions/src` triggers a rebuild, and the emulator reloads the updated code.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/572aeb3d-2fb2-4f5d-aaf2-34c485c03cfa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
