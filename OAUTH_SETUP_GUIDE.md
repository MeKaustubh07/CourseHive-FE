# 🔧 Google OAuth Setup Guide

## ❌ Current Issue
**Error:** "Google signup failed" with origin_mismatch

## ✅ Solution: Update Google Cloud Console

### Step 1: Access Google Cloud Console
1. Go to: https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client: `418592435785-f68qet5ssju9hsjaja3rbumq8jk4gml1.apps.googleusercontent.com`
3. Click **Edit** (pencil icon)

### Step 2: Add ALL Required Origins
In the **"Authorized JavaScript origins"** section, add:

```
http://localhost:5174
http://localhost:5175
http://localhost:3000
https://course-hive-kmp.vercel.app
```

### Step 3: Add Authorized Redirect URIs (if needed)
In the **"Authorized redirect URIs"** section, you might need:

```
http://localhost:5174/auth/callback
http://localhost:5175/auth/callback
http://localhost:3000/auth/callback
https://course-hive-kmp.vercel.app/auth/callback
```

### Step 4: Save & Wait
- Click **SAVE**
- Wait 5-10 minutes for changes to propagate
- Clear your browser cache

## 🔍 Debug Information
- **Current Local Origin**: http://localhost:5174
- **Production Origin**: https://course-hive-kmp.vercel.app
- **Client ID**: 418592435785-f68qet5ssju9hsjaja3rbumq8jk4gml1.apps.googleusercontent.com

## ⚠️ Common Mistakes
1. **Only adding production URL** - You need BOTH localhost AND production
2. **Wrong port number** - Make sure to use 5174 (current dev server port)
3. **Not waiting for propagation** - Google changes take 5-10 minutes
4. **Browser cache** - Clear cookies/cache after making changes

## ✅ Testing
After setup:
1. Open http://localhost:5174
2. Try Google Sign-in
3. Check browser console for OAuth debug logs
4. Should see "Google Auth Success" instead of errors