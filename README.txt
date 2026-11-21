ALL ABOUT FOOTBALL (AAF) — STARTER WEBSITE
Design: Premium dark black + football green; sports-site + fan-community blend.

FILES
- index.html: page structure
- styles.css: responsive design
- app.js: Firebase Authentication, live news feed, live comments
- firebase-config.js: paste your Firebase web-app config here
- firestore.rules: starter Firestore security rules
- storage.rules: starter Storage security rules

IMPORTANT SECURITY
1. Do not put a Firebase service-account JSON, private key, password, or admin credentials in this website.
2. Firebase web config is designed to be present in browser code. Security comes from Authentication and Security Rules.
3. The admin dashboard is not enabled in this first frontend starter. Admin access must be assigned securely using Firebase Admin SDK in a trusted server/Cloud Function. Set the custom claim { admin: true } only for your own verified account. Never let users set their own admin role.
4. Deploy the Firestore and Storage rules before opening the site publicly.
5. Username uniqueness is not yet enforced. Add a trusted server-side username reservation flow before launch if you need globally unique usernames.

FIREBASE SETUP
1. Open https://console.firebase.google.com and create a project named all-about-football (or a name available to you).
2. Add a Web App to the project and copy its Firebase configuration.
3. Enable Authentication > Sign-in method > Email/Password.
4. Create Firestore Database.
5. In Firestore Rules, paste firestore.rules and publish.
6. In Storage, enable it; paste storage.rules and publish.
7. Open firebase-config.js and replace every PASTE_* value with the matching value from your Firebase web app config.
8. Replace the WhatsApp channel placeholder with your real invite URL.
9. Run this project from a local web server (not by opening index.html as a file). You can use VS Code Live Server, Acode preview/server, or Firebase Hosting.

FIREBASE HOSTING
Install Node.js and Firebase CLI on a computer:
  npm install -g firebase-tools
  firebase login
  firebase init hosting
Choose the project, set the public directory to this folder, configure as a single-page app: No.
Then:
  firebase deploy

CURRENTLY CONNECTED WHEN CONFIGURED
- Email/password registration and login
- Username profile creation
- Live Firestore football news feed
- Live community comments

NEXT BUILD PHASES
- Secure admin dashboard + image upload to Firebase Storage
- Match and jersey-colour prediction creation/submission/scoring
- Player ratings and Man of the Match voting
- Club directory and club-specific fan quizzes
- Leaderboard and points
- Live scores/fixtures through a football data provider

NOTE
This is a first working foundation and visual prototype, not the complete feature list yet. Live scores require a football API. Do not publish as production-ready until security rules, admin claims, username uniqueness, moderation and abuse protection are tested.
