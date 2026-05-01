# GM Automation Dashboard

GM Automation Dashboard is an open-source social media management tool designed to help you create, schedule, and analyze content effortlessly. With a modern interface and powerful features, anyone can use it to streamline their social media presence.

## 🚀 Features

- **Interactive Dashboard:** Get a quick overview of your scheduled content and key metrics.
- **Post Creation:** Easily draft and create posts.
- **Carousel Builder:** Build engaging carousels visually and manage carousel assets.
- **Analytics:** Track post performance and audience engagement.
- **Post Queue:** View and manage your upcoming scheduled content.
- **Trends Analysis:** Stay up to date with trending topics to optimize your content strategy.
- **Admin & Settings:** Manage users, settings, and other configurations with dedicated admin panels.

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **State Management & Data Fetching:** Zustand, React Query (@tanstack/react-query)
- **Backend / Database:** Supabase (PostgreSQL, Auth, Storage)
- **Serverless Functions:** Netlify Functions
- **Other Tools:** Fabric.js (for canvas/carousel building), html-to-image, Recharts (for analytics), Lucide React (for icons)

## 📦 Prerequisites

Before getting started, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or another package manager
- A [Supabase](https://supabase.com/) account and project
- A [Netlify](https://www.netlify.com/) account (optional, for deployment)

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd gm-automation
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root directory and add the following variables. You can find these in your Supabase project settings:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # For setup scripts (Database & Storage setup)
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Initialize Supabase Database and Storage:**
   The project includes automated scripts to set up the database schema and storage buckets.

   Run the database setup script to apply the schema (`supabase-schema.sql`):
   ```bash
   node setup-db.mjs
   ```

   Run the storage bucket setup script (creates the `carousel_assets` bucket):
   ```bash
   node setup-bucket.mjs
   ```
   *Alternatively, you can run the SQL from `supabase-schema.sql` directly in your Supabase Dashboard SQL Editor.*

5. **Start the development server:**
   ```bash
   npm run dev
   ```
   *To run the dev server with Netlify CLI (useful if you are testing Netlify Functions locally):*
   ```bash
   npm run dev:netlify
   ```

## 🚀 Deployment

This project is configured to be easily deployed on Netlify.

You can build the project for production:
```bash
npm run build
```

Or deploy directly using Netlify CLI:
```bash
npm run deploy
```
Make sure to add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your environment variables in the Netlify Dashboard.

## 🤝 Contributing

This is an open-source project! Feel free to submit issues, fork the repository, and open pull requests.

## 📄 License

This project is open-source and available for anyone to use.
