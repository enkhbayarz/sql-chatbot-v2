# Deployment Guide - Vercel

## Step-by-Step Deployment Instructions

### 1. Commit and Push Your Code

```bash
# Check current status
git status

# Add all changes
git add .

# Commit changes
git commit -m "feat: ready for Vercel deployment"

# Push to GitHub
git push origin main
```

### 2. Set Up Environment Variables Locally

Make sure you have a `.env` file with:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DB_HOST=relational.fel.cvut.cz
DB_PORT=3306
DB_USER=guest
DB_PASSWORD=ctu-relational
DB_NAME=financial
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
```bash
pnpm add -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? `sql-chatbot-v2`
   - In which directory is your code located? `./`
   - Want to override settings? **N**

5. Add environment variables:
```bash
vercel env add GEMINI_API_KEY
# Paste your Gemini API key when prompted

vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DB_NAME
```

6. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository: `enkhbayarz/sql-chatbot-v2`
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build`
   - **Output Directory**: `.output/public`
   - **Install Command**: `pnpm install`

5. Add Environment Variables:
   Click "Environment Variables" and add:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   DB_HOST=relational.fel.cvut.cz
   DB_PORT=3306
   DB_USER=guest
   DB_PASSWORD=ctu-relational
   DB_NAME=financial
   ```

6. Click "Deploy"

### 4. Verify Deployment

Once deployed, Vercel will give you a URL like:
- `https://sql-chatbot-v2.vercel.app`

Test your deployment:
1. Open the URL
2. Try asking: "Show me all accounts"
3. Verify SQL generation and results display

### 5. Custom Domain (Optional)

1. Go to your project in Vercel
2. Navigate to "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### API Errors
- Check environment variables are set correctly
- Verify GEMINI_API_KEY is valid
- Check database connection settings

### Database Connection Issues
- Ensure the database host allows connections from Vercel IPs
- Verify credentials are correct
- Check if database requires SSL (add `ssl: { rejectUnauthorized: false }` if needed)

## Post-Deployment

### Monitor Your App
- View logs: `vercel logs`
- Check analytics in Vercel dashboard

### Update Deployment
```bash
git add .
git commit -m "your changes"
git push origin main
# Vercel will auto-deploy on push
```

## Important Notes

⚠️ **Security**:
- Never commit `.env` file (already in `.gitignore`)
- Use Vercel's environment variables for secrets
- Rotate API keys periodically

🎯 **Performance**:
- Vercel Edge Functions are used for API routes
- Database connections pool automatically
- First request may be slower (cold start)

📊 **Limits**:
- Free tier: 100 GB bandwidth/month
- Serverless function timeout: 10 seconds (Hobby), 60s (Pro)
- Consider upgrading if you hit limits
