# Deploying ytdown to Render.com (Free)

Since Vercel Serverless doesn't support the tools we need (Python, yt-dlp), we will use **Render.com**, which allows us to deploy our Docker container for free.

## FAST DEPLOY METHOD (Free)

1.  **Push your code to GitHub**
    - Make sure all these new files (`Dockerfile`, `.dockerignore`, updated `ytdlp.ts`) are pushed to your repository.

2.  **Create Account on Render.com**
    - Go to [dashboard.render.com](https://dashboard.render.com/) and sign up (you can login with GitHub).

3.  **New Web Service**
    - Click **"New +"** -> **"Web Service"**.
    - Select **"Build and deploy from a Git repository"**.
    - Connect your `ytdown` repository.

4.  **Configure Service**
    - **Name**: `ytdown-app` (or whatever you like)
    - **Region**: Choose the one closest to you (e.g., Singapore, Frankfurt, Oregon).
    - **Branch**: `main` (or `master`)
    - **Runtime**: **Docker** (This is important! Do not select Node).
    - **Instance Type**: **Free** (Scroll down to find the free tier).

5.  **Environment Variables (Optional)**
    - If you have any secrets in `.env.local`, add them under the "Environment" tab.

6.  **Deploy**
    - Click **"Create Web Service"**.
    - Render will start building your Docker image. This might take 5-10 minutes the first time.
    - Once finished, you will get a URL like `https://ytdown-app.onrender.com`.

## Troubleshooting
- **Build Failed?** Check the "Logs" tab in Render to see why.
- **App Crashing?** Ensure you selected **Docker** as the runtime, not Node.
