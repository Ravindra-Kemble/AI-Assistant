# Deploy to Azure Using Azure Portal

Follow these step-by-step instructions to deploy your chatbot without using CLI.

## Step 1: Create a GitHub Repository

1. Go to https://github.com and login
2. Click **New** to create a new repository
3. Name it: `ChatBot-Assistant`
4. Choose **Public** (easier for Azure to access)
5. Click **Create repository**
6. Push your local code:
   ```bash
   cd C:\Users\ravin\Desktop\ChatBot-Assistant\AI-Assistant
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ChatBot-Assistant.git
   git push -u origin main
   ```

## Step 2: Create Azure Account

1. Go to https://azure.microsoft.com
2. Click **Start free** or **Free account**
3. Sign in with Microsoft account or create new one
4. Complete registration and verify identity
5. You'll get $200 free credits for 30 days

## Step 3: Create App Service in Azure Portal

1. Go to https://portal.azure.com
2. Click **Create a resource** (blue button top left)
3. Search for: `App Service`
4. Click **App Service** → Click **Create**

### Fill in these details:

#### Basics tab:
- **Subscription**: Select your subscription
- **Resource Group**: Click "Create new"
  - Name: `groq-chatbot-rg`
  - Click **OK**
- **Name**: `groq-chatbot-app` (must be globally unique)
- **Publish**: `Code`
- **Runtime stack**: `Node 18 LTS`
- **Operating System**: `Windows` (or Linux)
- **Region**: `East US` (or closest to you)

#### Pricing tab (App Service Plan):
- **Sku and size**: Click **Change size**
  - Select `B1` (Basic - $5-15/month)
  - Click **Apply**

5. Click **Review + create**
6. Click **Create** and wait 2-3 minutes for deployment

## Step 4: Connect GitHub for Deployment

Once App Service is created:

1. Click **Go to resource**
2. In left menu, find **Deployment** section
3. Click **Deployment Center**
4. Select **Source**: `GitHub`
5. Click **Authorize** (sign in to GitHub if needed)
6. Fill in GitHub details:
   - **Organization**: Select your GitHub username
   - **Repository**: `ChatBot-Assistant`
   - **Branch**: `main`
7. Under **Workflow Settings**:
   - **Build provider**: `GitHub Actions`
   - Click **Save**

Azure will automatically create a GitHub Actions workflow and deploy your app!

## Step 5: Add Environment Variables (GROQ_API_KEY)

1. In App Service, go to **Settings** → **Configuration**
2. Click **New application setting**
3. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `your_groq_api_key_here`
4. Click **OK**
5. Click **Save** at the top

## Step 6: Monitor Deployment

1. Go to **Deployment** → **Deployments**
2. You'll see the GitHub Actions workflow running
3. Wait for it to complete (usually 2-5 minutes)
4. Once it says "Active" with a checkmark, deployment is successful!

## Step 7: Test Your App

Your app is now live at:
```
https://groq-chatbot-app.azurewebsites.net
```

Test the health endpoint:
```
https://groq-chatbot-app.azurewebsites.net/api/health
```

## Step 8: View Logs (if needed)

1. Click **Monitoring** → **Log stream**
2. This shows real-time logs from your app
3. Very helpful for debugging!

## Step 9: Enable Always On (Optional but Recommended)

1. Go to **Settings** → **Configuration**
2. Scroll to **General settings**
3. Toggle **Always On** to **On**
4. This prevents app from sleeping after 20 minutes of inactivity
5. Click **Save**

---

## Update Your Frontend URLs

In your `index.html`, update the API URL:

Change:
```javascript
const API_URL = 'http://localhost:3001/api';
```

To:
```javascript
const API_URL = 'https://groq-chatbot-app.azurewebsites.net/api';
```

Then push to GitHub:
```bash
git add index.html
git commit -m "Update API URL for Azure deployment"
git push
```

The app will auto-redeploy!

---

## Automatic Redeployment

Every time you push code to GitHub `main` branch:
1. GitHub Actions workflow runs automatically
2. Your app automatically redeploys
3. Check **Deployment Center** to see status

---

## Cost Estimation

- **B1 Plan**: $5-15/month
- **Free tier available** for first month with $200 credit
- App runs 24/7, very cost-effective

---

## Troubleshooting

### App not loading
1. Check **Log stream** for errors
2. Verify GROQ_API_KEY is set in Configuration
3. Wait 5 minutes after deployment

### 502 Bad Gateway
1. Check if `server.js` is using `process.env.PORT`
2. Restart app: Click **Restart** button at top

### Deployment keeps failing
1. Go to **Deployment Center**
2. Click on failed deployment to see error details
3. Check GitHub Actions logs in your repo

---

## Portal Links

- **Azure Portal**: https://portal.azure.com
- **Your App Service**: https://portal.azure.com → Search "groq-chatbot-app"
- **GitHub Actions**: https://github.com/YOUR_USERNAME/ChatBot-Assistant/actions

---

## Next Steps

1. ✅ Create GitHub repo
2. ✅ Create App Service
3. ✅ Connect GitHub
4. ✅ Set GROQ_API_KEY
5. ✅ Monitor deployment
6. ✅ Update frontend URLs
7. ✅ Test live app

**Your live app URL**: `https://groq-chatbot-app.azurewebsites.net`
