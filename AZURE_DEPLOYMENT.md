# Azure Deployment Guide for Groq Chatbot

## Prerequisites

1. Azure subscription (create at https://azure.microsoft.com)
2. Azure CLI installed
3. Git installed

## Step 1: Prepare Your Application

### Create `.env` file for local development

```
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

### Create `.gitignore` file

```
node_modules/
.env
.env.local
.DS_Store
*.log
npm-debug.log*
dist/
build/
```

## Step 2: Deploy to Azure App Service

### Option A: Using Azure CLI (Recommended)

1. **Login to Azure**

   ```bash
   az login
   ```

2. **Create a Resource Group**

   ```bash
   az group create --name groq-chatbot-rg --location eastus
   ```

3. **Create an App Service Plan**

   ```bash
   az appservice plan create --name groq-chatbot-plan --resource-group groq-chatbot-rg --sku B1 --is-linux
   ```

4. **Create a Web App (Node.js)**

   ```bash
   az webapp create --resource-group groq-chatbot-rg --plan groq-chatbot-plan --name groq-chatbot-app --runtime "NODE|18-lts"
   ```

5. **Set Environment Variables**

   ```bash
   az webapp config appsettings set --resource-group groq-chatbot-rg --name groq-chatbot-app --settings GROQ_API_KEY=your_api_key_here
   ```

6. **Deploy from GitHub (if using Git)**
   - Push your code to GitHub
   - Connect your GitHub repo to Azure App Service
   - Or use Azure CLI:
   ```bash
   az webapp up --name groq-chatbot-app --resource-group groq-chatbot-rg --runtime "NODE|18-lts"
   ```

### Option B: Using Azure Portal

1. Go to Azure Portal (https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Web App"
4. Fill in the details:
   - **Subscription**: Your subscription
   - **Resource Group**: Create new or select existing
   - **Name**: groq-chatbot-app
   - **Runtime Stack**: Node 18 LTS
   - **Region**: Choose closest to you
5. Click "Create"

## Step 3: Configure Deployment

### Set up GitHub Actions for CI/CD

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: npm install and build
        run: |
          npm install

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: groq-chatbot-app
          publish-profile: ${{ secrets.AZURE_PUBLISHPROFILE }}
          package: .
```

### Get Publish Profile

1. In Azure Portal, go to your Web App
2. Download publish profile (top-right menu)
3. In GitHub, go to Settings > Secrets and variables > Actions
4. Create secret `AZURE_PUBLISHPROFILE` and paste the profile content

## Step 4: Configure Application Settings

In Azure Portal > Web App > Configuration:

Add these Application settings:

- **GROQ_API_KEY**: Your Groq API key
- **PORT**: 3001 (or leave default)
- **NODE_ENV**: production

## Step 5: Additional Configurations

### Enable CORS for Azure

Update your server.js CORS settings:

```javascript
app.use(
  cors({
    origin: ["https://groq-chatbot-app.azurewebsites.net"],
    credentials: true,
  })
);
```

### Static Files (Frontend)

Update server.js to serve your frontend:

```javascript
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});
```

Move `index.html`, `styles.css`, `icons.jsx`, `GroqChatbot.jsx` to a `public/` folder.

## Step 6: Monitor Your Deployment

### View Logs

```bash
az webapp log tail --name groq-chatbot-app --resource-group groq-chatbot-rg
```

### Check Application Health

```bash
curl https://groq-chatbot-app.azurewebsites.net/api/health
```

## Cost Optimization Tips

1. **Use B1 Plan** ($5-15/month) for development/testing
2. **Auto-scale** for production traffic
3. **Enable Always On** in App Service > Configuration
4. **Use Application Insights** for monitoring

## Troubleshooting

### App won't start

- Check logs: `az webapp log tail`
- Verify GROQ_API_KEY is set
- Check Node version compatibility

### CORS errors

- Update CORS origin to your Azure domain
- Test with `curl` first

### Port binding errors

- Azure uses PORT environment variable
- Ensure server.js uses `process.env.PORT`

## Useful Azure Commands

```bash
# List all web apps
az webapp list

# View app settings
az webapp config appsettings list --name groq-chatbot-app --resource-group groq-chatbot-rg

# Restart app
az webapp restart --name groq-chatbot-app --resource-group groq-chatbot-rg

# Delete resources
az group delete --name groq-chatbot-rg
```

## Next Steps

1. Test locally: `npm start`
2. Push to GitHub
3. Deploy using methods above
4. Monitor with Application Insights
5. Set up custom domain (optional)

Your app will be available at: `https://groq-chatbot-app.azurewebsites.net`
