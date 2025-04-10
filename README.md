# file-drop

## Goals

1. User logs in
2. Signs up for rss feeds
3. Gets weekly notifications about new blog posts on these blogs

## Tech Goals

1. UI - login, signup for feeds, manage intervals, see blog posts
2. Auth
3. Manage a user - login, subscriptions, destination email
4. Fetch feed, and recurringly do so on intervals
5. Construct summary of all new posts every (interval), send email

##

1. Generate auth-schema with: `npx @better-auth/cli@latest generate --config worker/src/routes/auth.\[\[auth\]\].t`
2. Execute migrations: `npx wrangler d1 execute file-drop-prod --file=drizzle/0000_flashy_pandemic.sql --config worker/wrangler.json`
