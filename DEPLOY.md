# Deployment Guide - Ami Commerce on Render

Deploy this application to Render in under 5 minutes using Render's Blueprint Infrastructure as Code.

---

## Prerequisites

1. A [Render Account](https://render.com).
2. A [GitHub](https://github.com) account with your code pushed.

---

## Step-by-Step Instructions

### Step 1: Ensure Server Health Check Exists
Ensure your `server/index.js` or Express app includes a `/health` endpoint returning `200 OK`:

```javascript
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
```

### Step 2: Push Code to GitHub

Execute the following commands in your terminal:

```bash
git add .
git commit -m "feat: setup Render deployment configurations"
git push origin main
```

### Step 3: Connect to Render via Blueprint

1. Go to the [Render Dashboard](https://dashboard.render.com).
2. Click **New +** top right corner and select **Blueprint**.
3. Connect your GitHub repository.
4. Render will read `render.yaml` automatically and prompt to create:
   - **ami-commerce-app** (Web Service via Docker)
   - **ami-commerce-db** (Managed PostgreSQL/MongoDB instance or managed MongoDB provider link)
5. Click **Apply**.

---

## Setting up Automated Deployment (CI/CD)

1. Go to your Web Service settings in the Render dashboard.
2. Copy the **Deploy Hook URL**.
3. Open your GitHub Repository -> **Settings** -> **Secrets and variables** -> **Actions**.
4. Add a secret named `RENDER_DEPLOY_HOOK_URL` and paste the URL.

Every future commit pushed to `main` will automatically build, test, and deploy!