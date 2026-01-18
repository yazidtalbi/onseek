# Strapi CMS Setup Guide

This guide will help you set up Strapi CMS for managing your website content.

## Prerequisites

- Node.js 18.x or higher
- npm or yarn

## Step 1: Install Strapi

You can install Strapi globally or create a new Strapi project:

```bash
# Option 1: Install Strapi globally
npm install -g strapi

# Option 2: Create a new Strapi project (recommended)
npx create-strapi-app@latest my-strapi --quickstart
```

## Step 2: Configure Strapi

1. Start your Strapi server:
   ```bash
   cd my-strapi
   npm run develop
   ```

2. Create an admin account when prompted (first time only)

3. Access the admin panel at `http://localhost:1337/admin`

## Step 3: Create Content Types

You need to create the following content types in Strapi:

### 1. Landing Page (`landing-pages`)

**Collection Type Name:** `landing-pages`

**Fields:**
- `heroBadge` (Text, Short text)
- `heroTitle` (Text, Long text)
- `heroDescription` (Text, Long text)
- `ctaPrimaryText` (Text, Short text)
- `ctaPrimaryLink` (Text, Short text)
- `ctaSecondaryText` (Text, Short text)
- `ctaSecondaryLink` (Text, Short text)
- `features` (Component, Repeatable) - Create a component called `feature-item` with:
  - `title` (Text, Short text)
  - `description` (Text, Long text)
- `sampleRequest` (Component, Single) - Create a component called `sample-request` with:
  - `title` (Text, Short text)
  - `description` (Text, Long text)
  - `topSubmission` (Component, Single) - Create a component called `top-submission` with:
    - `text` (Text, Long text)
    - `score` (Text, Short text)
    - `store` (Text, Short text)
    - `price` (Text, Short text)

### 2. Pages (`pages`)

**Collection Type Name:** `pages`

**Fields:**
- `title` (Text, Short text)
- `slug` (UID, based on `title`, unique)
- `content` (Rich text or Text, Long text)
- `seoTitle` (Text, Short text, optional)
- `seoDescription` (Text, Long text, optional)
- `seoImage` (Media, Single image, optional)

### 3. Site Settings (`site-settings`)

**Single Type Name:** `site-settings`

**Fields:**
- `siteName` (Text, Short text)
- `siteDescription` (Text, Long text)
- `logo` (Media, Single image, optional)
- `favicon` (Media, Single image, optional)
- `footerText` (Text, Long text, optional)
- `socialLinks` (JSON, optional) - Structure:
  ```json
  {
    "twitter": "https://twitter.com/yourhandle",
    "facebook": "https://facebook.com/yourpage",
    "instagram": "https://instagram.com/yourhandle",
    "linkedin": "https://linkedin.com/company/yourcompany"
  }
  ```

### 4. Navigation Items (`navigation-items`)

**Collection Type Name:** `navigation-items`

**Fields:**
- `label` (Text, Short text)
- `url` (Text, Short text)
- `target` (Enumeration: `_self`, `_blank`, default: `_self`)
- `order` (Number, Integer)

### 5. Announcements (`announcements`)

**Collection Type Name:** `announcements`

**Fields:**
- `title` (Text, Short text)
- `message` (Text, Long text)
- `type` (Enumeration: `info`, `warning`, `success`, `error`)
- `isActive` (Boolean, default: `false`)
- `link` (Text, Short text, optional)
- `linkText` (Text, Short text, optional)

## Step 4: Configure API Permissions

1. Go to **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Enable the following permissions for each content type:
   - `landing-pages`: `find`, `findOne`
   - `pages`: `find`, `findOne`
   - `site-settings`: `find`, `findOne`
   - `navigation-items`: `find`, `findOne`
   - `announcements`: `find`, `findOne`

## Step 5: Create API Token (Optional)

If you want to use protected endpoints or preview content:

1. Go to **Settings** → **API Tokens**
2. Click **Create new API Token**
3. Name it (e.g., "Next.js App")
4. Token type: **Full access** or **Read-only**
5. Copy the token and add it to your `.env` file as `STRAPI_API_TOKEN`

## Step 6: Configure Environment Variables

Add the following to your `.env` file:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=your_api_token_here
```

For production, update `NEXT_PUBLIC_STRAPI_URL` to your production Strapi URL.

## Step 7: Add Sample Content

1. Create at least one **Landing Page** entry with sample content
2. Create **Pages** entries for "terms" and "privacy" slugs
3. Create a **Site Settings** entry
4. Add some **Navigation Items** if needed
5. Make sure to **Publish** all entries (not just save as draft)

## Step 8: Test the Integration

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` - the landing page should display content from Strapi
3. Visit `http://localhost:3000/terms` and `http://localhost:3000/privacy` - these should also use CMS content

## Troubleshooting

### Content not showing up?

1. **Check if content is published**: In Strapi, make sure entries are **Published**, not just saved as drafts
2. **Check API permissions**: Ensure public role has `find` and `findOne` permissions
3. **Check environment variables**: Verify `NEXT_PUBLIC_STRAPI_URL` is set correctly
4. **Check Strapi server**: Make sure Strapi is running on the configured port
5. **Check browser console**: Look for any API errors in the browser console

### CORS Issues?

If you're running Strapi and Next.js on different ports/domains, configure CORS in Strapi:

1. Go to **Settings** → **Middleware**
2. Enable CORS and add your Next.js URL to allowed origins

### Image URLs not working?

Make sure your Strapi URL is correctly configured. Images are served from the Strapi server, so the URL should point to your Strapi instance.

## Production Deployment

For production:

1. Deploy Strapi to a hosting service (Heroku, Railway, DigitalOcean, etc.)
2. Update `NEXT_PUBLIC_STRAPI_URL` to your production Strapi URL
3. Set up environment variables in your hosting platform
4. Configure CORS to allow requests from your production Next.js domain

## Additional Resources

- [Strapi Documentation](https://docs.strapi.io/)
- [Strapi REST API](https://docs.strapi.io/dev-docs/api/rest)
- [Strapi Content-Type Builder](https://docs.strapi.io/dev-docs/backend-customization/models)

