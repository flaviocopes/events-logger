# Demo Walkthrough

A scripted walkthrough for presenting the Events Logger app. Load the demo data and follow this guide to show each feature.

---

## Setup (before the demo)

```bash
# Start the dev server
npm run dev

# Load all 4 demo scenarios (replaces existing data)
node cli/index.js load --file demos/all-scenarios.json

# Or load a single scenario:
# node cli/index.js load --file demos/ecommerce.json
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

---

## The Story

> "Imagine you run multiple products and services. You want a single place to see exactly what's happening across all of them — signups, orders, deploys, errors, newsletter growth — in real time. That's what this app does."

---

## Part 1: Home — Project Overview

**Open:** [http://localhost:4321](http://localhost:4321)

**Say:**

> "This is the home screen. Each card is a separate project that pushes events to the dashboard. Right now we have four: an e-commerce store, a SaaS app, a CI/CD pipeline, and a content platform. Each shows how many events have been tracked."

**Show:**
- Point to the 4 project cards: QuickShop, LaunchPad SaaS, DeployBot, BlogWave
- Mention the event counts on each

---

## Part 2: QuickShop — E-commerce Feed

**Click:** QuickShop → Feed

**Say:**

> "This is the event feed for QuickShop, our e-commerce store. Every order, cart action, signup, and payment appears here in real time. Each event has an icon, title, description with markdown formatting, and metadata tags."

**Show:**
- Scroll through the feed to show different event types
- Point out the **bold text** in descriptions and emoji icons
- Click a category in the sidebar (e.g., "orders") to filter events
- Use the search bar to search for "Payment Failed" — show how filtering works
- Clear the search

**Say:**

> "Events come in through a simple API. Any service — your backend, a webhook, a cron job — can push events with a single HTTP call."

---

## Part 3: QuickShop — Charts

**Click:** Charts (in the sidebar)

**Say:**

> "The charts page shows event volume over the past 30 days, broken down by category. You can see patterns: when orders spike, when signups increase. Each category gets its own chart automatically."

**Show:**
- Point to the different category charts (signups, orders, cart, payments)
- Note the time distribution across the 30-day period

---

## Part 4: QuickShop — Insights

**Click:** Insights (in the sidebar)

**Say:**

> "Insights are live KPIs. Unlike events that capture moments, insights track current values — total revenue, conversion rate, active users. Your backend updates these whenever the numbers change."

**Show:**
- Point to the 6 insight cards: Total Revenue, Total Orders, Conversion Rate, Active Users, Avg Order Value, Cart Abandonment
- Mention they auto-refresh via HTMX polling

---

## Part 5: Switch to DeployBot — DevOps Use Case

**Click:** Go back to Home → DeployBot → Feed

**Say:**

> "Same tool, completely different use case. DeployBot tracks our CI/CD pipeline. Every deploy, build, release, and incident shows up here. The SEV-1 incidents have the notify flag -- see the bell icon and purple border? Those stand out in the feed so you won't miss them."

**Show:**
- Scroll through deployments, builds, incidents
- Filter to "incidents" category — show SEV-1, SEV-2, SEV-3 events
- Switch to "builds" — show passed vs failed builds
- Click Charts to show deploy/build frequency over time
- Click Insights — show Deploy Frequency, Build Success Rate, MTTR, Uptime

---

## Part 6: LaunchPad — SaaS Monitoring

**Click:** Home → LaunchPad SaaS → Feed

**Say:**

> "LaunchPad tracks a SaaS application. We see user logins, plan upgrades, API usage, errors, and feature adoption. This gives product and engineering teams visibility into what users actually do."

**Show:**
- Filter to "auth" — show login events with browser/OS tags
- Filter to "errors" — show server errors with severity tags
- Filter to "billing" — show plan upgrades and payments
- Switch to Insights — show MRR, Active Subscriptions, Churn Rate, API Requests

---

## Part 7: BlogWave — Content Platform

**Click:** Home → BlogWave → Feed

**Say:**

> "BlogWave tracks a content platform and newsletter. Every new subscriber, published article, newsletter send, and page view is tracked. You can see subscriber growth, open rates, and traffic sources all in one place."

**Show:**
- Filter to "subscribers" — show new subscriber events with source tags
- Filter to "newsletter" — show newsletter sends with open/click rates
- Switch to Insights — show Total Subscribers, Avg Open Rate, Monthly Page Views

---

## Part 8: Playground (Live Demo)

**Click:** Any project → Playground

**Say:**

> "The playground lets you push events interactively. Fill in the fields, and it even generates the curl command and fetch code you'd use in your app."

**Show:**
- Fill in: category = "demo", title = "Live Demo Event", icon = "🎯"
- Add a description: "This event was pushed **live** during the demo"
- Show the curl command updating in real time
- Click "Send Event"
- Switch to Feed — show the event that just appeared

---

## Part 9: CLI & Export/Import

**Switch to terminal:**

**Say:**

> "Everything you can do in the UI, you can also do from the command line. And you can export all data to JSON and load it back — great for backups, sharing demos, or resetting to a known state."

**Run:**

```bash
# Push an event from the CLI
node cli/index.js push \
  --api-key ev_your-key \
  --project demo-ecommerce \
  --category demo \
  --title "CLI Event" \
  --description "Pushed from the **terminal**" \
  --icon "💻"

# Export everything
node cli/index.js export --file backup.json

# Show what was exported
cat backup.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.projects.length+' projects, '+d.events.length+' events')"
```

---

## Part 10: Settings & API Key

**Click:** Settings (gear icon in sidebar)

**Say:**

> "Each project has its own API key. This is how services authenticate when pushing events. You can reveal the key, copy it, and use it in your application's integration."

**Show:**
- Click "Reveal" to show the API key
- Point to the project info and danger zone

---

## Part 11: Architecture (if asked)

**Say:**

> "The stack is deliberately simple: Astro for server-side rendering, HTMX for dynamic updates without writing JavaScript, Alpine.js for small interactive bits, and SQLite for the database. No React, no external database server. The entire app runs locally with `npm run dev`. You can push events from anywhere using the REST API or the CLI."

---

## Closing

> "The key idea is that any application, script, or service can push structured events to the dashboard. It's like having a live activity log across everything you build. And because it's self-hosted with SQLite, your data never leaves your machine."

---

## Quick Reference: API Keys for Demo Projects

| Project | API Key |
|---------|---------|
| QuickShop | `ev_demo_ecommerce_key_001` |
| LaunchPad SaaS | `ev_demo_saas_key_002` |
| DeployBot | `ev_demo_devops_key_003` |
| BlogWave | `ev_demo_content_key_004` |

## Quick Reference: CLI Commands

```bash
# Load a demo scenario
node cli/index.js load --file demos/ecommerce.json
node cli/index.js load --file demos/all-scenarios.json

# Load without replacing (merge with existing)
node cli/index.js load --file demos/saas.json --merge

# Export current data
node cli/index.js export --file my-backup.json

# Push a test event
node cli/index.js push --api-key ev_your-key --project demo-ecommerce --category test --title "Hello"

# Create a new project
node cli/index.js init --api-key ev_your-key --name "My Project"

# Update an insight
node cli/index.js insight --api-key ev_your-key --project demo-ecommerce --title "Users" --value "1,500" --icon "👥"

# Regenerate demo data (fresh random data)
node demos/generate.js
```
