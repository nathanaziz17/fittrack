# FitTrack — Deployment Guide

Follow these steps exactly and your app will be live in about 10 minutes.

---

## Step 1 — Download this project

You should have downloaded a ZIP file containing this folder. Unzip it somewhere on your computer (e.g. your Desktop).

---

## Step 2 — Create a GitHub repository

1. Go to **github.com** and sign in
2. Click the **+** icon (top right) → **New repository**
3. Name it: `fittrack` (or anything you like)
4. Leave everything else as default
5. Click **Create repository**

---

## Step 3 — Upload the files to GitHub

On the next screen GitHub shows after creating the repo:

1. Click **uploading an existing file** (it's a link in the middle of the page)
2. Drag and drop **all the files from this folder** into the upload area
   - Make sure you upload the files INSIDE the folder, not the folder itself
   - You should see: `index.html`, `package.json`, `vite.config.js`, `.gitignore`, and the `src` folder
3. Scroll down, click **Commit changes**

---

## Step 4 — Deploy on Vercel

1. Go to **vercel.com** and sign in with your GitHub account
2. Click **Add New** → **Project**
3. Find your `fittrack` repo in the list and click **Import**
4. Vercel will auto-detect it's a Vite project — don't change any settings
5. Click **Deploy**
6. Wait about 60 seconds — done ✅

Vercel gives you a URL like `fittrack-abc123.vercel.app` — that's your app, live on the internet.

---

## Step 5 — Add to your iPhone home screen

1. Open the URL in **Safari** on your iPhone (must be Safari, not Chrome)
2. Tap the **Share** button (box with arrow pointing up)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**

It'll appear on your home screen like a real app — full screen, no browser bar.

---

## Sharing with mates

Just send them the Vercel URL. They open it in Safari and follow Step 5 to add it to their home screen too.

---

## Making changes in the future

Whenever you want a feature added or changed:

1. Get the updated `App.jsx` file (from Claude)
2. Go to your GitHub repo
3. Click on `src` folder → `App.jsx`
4. Click the **pencil icon** (Edit) — or drag the new file in via the upload page
5. Commit the changes
6. Vercel automatically redeploys within 30 seconds — no action needed

---

## Your app URL

Write it here once you have it:

`_______________________________`
