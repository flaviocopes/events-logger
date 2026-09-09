# Roadmap

This is a list of ideas, not a commitment. Nothing here is planned. The features were inspired by [LogSnag](https://logsnag.com).

## Implemented

- **Feed** -- chronological event list with search, category filtering, HTMX auto-refresh
- **Charts** -- bar charts per category with event counts over time
- **Insights** -- KPI dashboard cards in a 2-column grid
- **Playground** -- interactive form to test event pushing with live code preview
- **Settings** -- API key reveal/hide, project info, danger zone delete
- **User ID tracking** -- events accept a `user_id` field for user identification
- **Responsive layout** -- collapsible sidebar with hamburger menu on mobile
- **SVG icon navigation** -- sidebar uses Feather-style SVG icons instead of emoji
- **Event favorites** -- toggle events as favorites, filter feed to show only favorited events
- **Event deletion** -- delete individual events from the feed
- **Insight deletion** -- delete individual insight cards from the dashboard

## Ideas

### Summary Dashboard
A project home page with aggregated KPIs (Daily Active, Monthly Active, Signups Today, All Users), a line chart of daily active users over time, and inline metric cards.

### Users Section
A dedicated users area that lists identified users (from `user_id` on events). Lists: online, recent, power, active, drifting. Searchable.

### User Profiles
Detailed user pages showing: first seen, last seen, sessions, avg session time, activity heatmap (GitHub-style), most used features, properties (key-value), and event journey timeline.

### Feature Usage Analytics
Track feature adoption and usage patterns. Show daily/monthly users per feature, adoption percentage, power users list, and weekly usage bar charts.

### Onboarding Flow
Step-by-step getting started guide for new projects: create project, create category, get API token, publish first event.

### Category Management
Add/edit/delete categories from the UI. Currently categories are auto-created when events reference them.

### Notifications (enhanced)
Events with `notify: true` trigger OS-level browser notifications and are highlighted in the feed with a bell icon and purple left border. Users must grant notification permission via the bell button in the feed header. Future enhancements: email and webhook notifications.

### Event Detail View
Click an event card to see full details, raw JSON, tags, and user info.

### Export
Export events as CSV/JSON for a given date range and category filter.

