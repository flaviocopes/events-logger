#!/usr/bin/env node
/**
 * Generates all demo scenario JSON files.
 * Run: node demos/generate.js
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NOW = Math.floor(Date.now() / 1000);
const DAY = 86400;
const HOUR = 3600;
const MIN = 60;

function ts(daysAgo, hoursAgo = 0, minsAgo = 0) {
  return NOW - (daysAgo * DAY) - (hoursAgo * HOUR) - (minsAgo * MIN);
}

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 14); }

// ── Scenario 1: E-commerce Store (QuickShop) ──────────────────────────

function generateEcommerce() {
  const projectId = 'demo-ecommerce';
  const created = ts(30);

  const users = ['user_alice', 'user_bob', 'user_carol', 'user_dave', 'user_eve', 'user_frank', 'user_grace', 'user_hank', 'user_iris', 'user_jack', 'user_kate', 'user_leo', 'user_maya', 'user_nick', 'user_olivia'];
  const products = [
    { name: 'Wireless Headphones', price: 79.99, category: 'Electronics' },
    { name: 'Running Shoes Pro', price: 129.99, category: 'Footwear' },
    { name: 'Organic Coffee Beans 1kg', price: 24.99, category: 'Food' },
    { name: 'Laptop Stand', price: 49.99, category: 'Accessories' },
    { name: 'Yoga Mat Premium', price: 39.99, category: 'Fitness' },
    { name: 'Mechanical Keyboard', price: 149.99, category: 'Electronics' },
    { name: 'Water Bottle 1L', price: 19.99, category: 'Accessories' },
    { name: 'Backpack Urban', price: 89.99, category: 'Bags' },
    { name: 'Desk Lamp LED', price: 34.99, category: 'Home' },
    { name: 'Sunglasses Classic', price: 59.99, category: 'Accessories' },
  ];
  const countries = ['US', 'UK', 'DE', 'FR', 'IT', 'CA', 'AU', 'JP', 'BR', 'IN'];
  const plans = ['free', 'starter', 'pro'];

  const categoryNames = ['signups', 'orders', 'cart', 'payments', 'reviews', 'support'];
  const categoryRows = categoryNames.map(name => ({ project_id: projectId, name, created_at: created }));

  const events = [];

  for (let day = 29; day >= 0; day--) {
    const signupsToday = randomBetween(1, 4);
    for (let i = 0; i < signupsToday; i++) {
      const user = pick(users);
      events.push({
        project_id: projectId, category: 'signups', title: 'New User Registered',
        description: `**${user}** signed up from ${pick(countries)}`,
        icon: '👤', tags: JSON.stringify({ country: pick(countries), plan: pick(plans) }),
        user_id: user, notify: 0, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    const cartAdds = randomBetween(3, 10);
    for (let i = 0; i < cartAdds; i++) {
      const product = pick(products);
      const user = pick(users);
      events.push({
        project_id: projectId, category: 'cart', title: 'Item Added to Cart',
        description: `**${product.name}** — $${product.price}`,
        icon: '🛒', tags: JSON.stringify({ product: product.name, price: product.price, category: product.category }),
        user_id: user, notify: 0, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    const ordersToday = randomBetween(2, 7);
    for (let i = 0; i < ordersToday; i++) {
      const product = pick(products);
      const qty = randomBetween(1, 3);
      const total = (product.price * qty).toFixed(2);
      const user = pick(users);
      const orderId = `ORD-${uid()}`;
      events.push({
        project_id: projectId, category: 'orders', title: 'New Order Placed',
        description: `${qty}x **${product.name}** — Total: **$${total}**`,
        icon: '📦', tags: JSON.stringify({ order_id: orderId, total: parseFloat(total), items: qty }),
        url: `https://quickshop.example.com/admin/orders/${orderId}`,
        user_id: user, notify: 1, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    const paymentsToday = randomBetween(2, 6);
    for (let i = 0; i < paymentsToday; i++) {
      const amount = randomBetween(20, 400);
      const user = pick(users);
      const status = Math.random() > 0.08 ? 'succeeded' : 'failed';
      events.push({
        project_id: projectId, category: 'payments', title: status === 'succeeded' ? 'Payment Successful' : 'Payment Failed',
        description: status === 'succeeded'
          ? `**$${amount}.00** charged via ${pick(['Visa', 'Mastercard', 'Amex', 'PayPal'])}`
          : `**$${amount}.00** charge **declined** — insufficient funds`,
        icon: status === 'succeeded' ? '💳' : '❌',
        tags: JSON.stringify({ amount, currency: 'USD', status, method: pick(['visa', 'mastercard', 'amex', 'paypal']) }),
        user_id: user, notify: status === 'failed' ? 1 : 0,
        created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (day % 3 === 0) {
      const product = pick(products);
      const stars = randomBetween(3, 5);
      events.push({
        project_id: projectId, category: 'reviews', title: `${stars}-Star Review`,
        description: `**${pick(users)}** reviewed **${product.name}**: "${'⭐'.repeat(stars)}"`,
        icon: '⭐', tags: JSON.stringify({ product: product.name, rating: stars }),
        user_id: pick(users), notify: 0, created_at: ts(day, randomBetween(8, 20), randomBetween(0, 59)),
      });
    }

    if (day % 5 === 0) {
      const ticketId = `TKT-${uid()}`;
      events.push({
        project_id: projectId, category: 'support', title: 'Support Ticket Opened',
        description: `${pick(['Order not received', 'Refund request', 'Product defective', 'Wrong item shipped', 'Billing question'])}`,
        icon: '🎫', tags: JSON.stringify({ priority: pick(['low', 'medium', 'high']) }),
        url: `https://quickshop.example.com/support/tickets/${ticketId}`,
        user_id: pick(users), notify: 1, created_at: ts(day, randomBetween(8, 18), randomBetween(0, 59)),
      });
    }
  }

  const totalRevenue = events.filter(e => e.category === 'payments' && e.title === 'Payment Successful')
    .reduce((sum, e) => sum + JSON.parse(e.tags).amount, 0);
  const totalOrders = events.filter(e => e.category === 'orders').length;

  const insights = [
    { project_id: projectId, title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: '💰', updated_at: NOW },
    { project_id: projectId, title: 'Total Orders', value: totalOrders.toString(), icon: '📦', updated_at: NOW },
    { project_id: projectId, title: 'Conversion Rate', value: '3.2%', icon: '📈', updated_at: NOW },
    { project_id: projectId, title: 'Active Users', value: '1,248', icon: '👥', updated_at: NOW },
    { project_id: projectId, title: 'Avg Order Value', value: `$${Math.round(totalRevenue / totalOrders)}`, icon: '🧾', updated_at: NOW },
    { project_id: projectId, title: 'Cart Abandonment', value: '28.4%', icon: '🛒', updated_at: NOW },
  ];

  return {
    exportedAt: new Date().toISOString(),
    projects: [{ id: projectId, name: 'QuickShop', created_at: created }],
    categories: categoryRows,
    events: events.sort((a, b) => a.created_at - b.created_at),
    insights,
  };
}

// ── Scenario 2: SaaS App (LaunchPad) ──────────────────────────────────

function generateSaas() {
  const projectId = 'demo-saas';
  const created = ts(30);

  const users = ['usr_acme', 'usr_globex', 'usr_initech', 'usr_hooli', 'usr_piedpiper', 'usr_stark', 'usr_wayne', 'usr_umbrella', 'usr_capsule', 'usr_skynet', 'usr_weyland', 'usr_cyberdyne'];
  const features = ['Dashboard', 'Reports', 'Team Settings', 'API Keys', 'Billing', 'Integrations', 'Export', 'Notifications'];
  const tiers = ['free', 'starter', 'pro', 'enterprise'];

  const categoryNames = ['auth', 'billing', 'usage', 'errors', 'features', 'onboarding'];
  const categoryRows = categoryNames.map(name => ({ project_id: projectId, name, created_at: created }));
  const events = [];

  for (let day = 29; day >= 0; day--) {
    const logins = randomBetween(5, 15);
    for (let i = 0; i < logins; i++) {
      const user = pick(users);
      events.push({
        project_id: projectId, category: 'auth', title: 'User Login',
        description: `**${user}** logged in from ${pick(['Chrome', 'Firefox', 'Safari', 'Edge'])} on ${pick(['macOS', 'Windows', 'Linux'])}`,
        icon: '🔐', tags: JSON.stringify({ browser: pick(['Chrome', 'Firefox', 'Safari']), os: pick(['macOS', 'Windows', 'Linux']) }),
        user_id: user, notify: 0, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (Math.random() > 0.5) {
      const user = pick(users);
      events.push({
        project_id: projectId, category: 'auth', title: 'Failed Login Attempt',
        description: `Multiple failed attempts for **${user}** from IP ${randomBetween(10, 200)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}.${randomBetween(0, 255)}`,
        icon: '⚠️', tags: JSON.stringify({ attempts: randomBetween(3, 8), ip_blocked: Math.random() > 0.5 }),
        user_id: user, notify: 1, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (day % 4 === 0) {
      const user = pick(users);
      const from = pick(tiers);
      const to = tiers[Math.min(tiers.indexOf(from) + 1, tiers.length - 1)];
      events.push({
        project_id: projectId, category: 'billing', title: from === to ? 'Subscription Renewed' : 'Plan Upgraded',
        description: from === to ? `**${user}** renewed **${from}** plan` : `**${user}** upgraded from **${from}** to **${to}**`,
        icon: '💎', tags: JSON.stringify({ from_plan: from, to_plan: to }),
        url: `https://launchpad.example.com/admin/customers/${user}`,
        user_id: user, notify: 1, created_at: ts(day, randomBetween(8, 18), randomBetween(0, 59)),
      });
    }

    if (day % 6 === 0) {
      events.push({
        project_id: projectId, category: 'billing', title: 'Payment Received',
        description: `Invoice **INV-${uid().slice(0, 6).toUpperCase()}** — **$${pick([29, 49, 99, 199, 499])}**/mo`,
        icon: '💰', tags: JSON.stringify({ amount: pick([29, 49, 99, 199, 499]) }),
        user_id: pick(users), notify: 0, created_at: ts(day, 10, randomBetween(0, 59)),
      });
    }

    const apiCalls = randomBetween(2, 6);
    for (let i = 0; i < apiCalls; i++) {
      events.push({
        project_id: projectId, category: 'usage', title: 'API Request',
        description: `${pick(['GET', 'POST', 'PUT', 'DELETE'])} /api/${pick(['users', 'projects', 'reports', 'teams', 'exports'])} — ${pick(['200 OK', '200 OK', '200 OK', '201 Created', '400 Bad Request'])}`,
        icon: '🔌', tags: JSON.stringify({ endpoint: pick(['/api/users', '/api/reports']), status: pick([200, 200, 200, 201, 400]) }),
        user_id: pick(users), notify: 0, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (Math.random() > 0.6) {
      events.push({
        project_id: projectId, category: 'errors', title: 'Server Error (500)',
        description: `**${pick(['TypeError', 'ReferenceError', 'DatabaseError', 'TimeoutError'])}** in ${pick(['UserService', 'ReportGenerator', 'BillingWorker', 'EmailSender'])}`,
        icon: '🔴', tags: JSON.stringify({ severity: pick(['warning', 'error', 'critical']), stack: 'truncated' }),
        user_id: null, notify: 1, created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    const featureUsage = randomBetween(2, 5);
    for (let i = 0; i < featureUsage; i++) {
      const feature = pick(features);
      events.push({
        project_id: projectId, category: 'features', title: `Feature Used: ${feature}`,
        description: `**${pick(users)}** accessed **${feature}**`,
        icon: '⚡', tags: JSON.stringify({ feature, duration_ms: randomBetween(200, 5000) }),
        user_id: pick(users), notify: 0, created_at: ts(day, randomBetween(6, 22), randomBetween(0, 59)),
      });
    }

    if (day % 7 === 0) {
      events.push({
        project_id: projectId, category: 'onboarding', title: 'Onboarding Completed',
        description: `**${pick(users)}** finished onboarding in **${randomBetween(2, 15)} minutes**`,
        icon: '🎉', tags: JSON.stringify({ steps_completed: randomBetween(4, 7), total_steps: 7 }),
        user_id: pick(users), notify: 0, created_at: ts(day, randomBetween(8, 18), randomBetween(0, 59)),
      });
    }
  }

  const insights = [
    { project_id: projectId, title: 'Monthly Recurring Revenue', value: '$12,480', icon: '💰', updated_at: NOW },
    { project_id: projectId, title: 'Active Subscriptions', value: '156', icon: '📋', updated_at: NOW },
    { project_id: projectId, title: 'Churn Rate', value: '2.1%', icon: '📉', updated_at: NOW },
    { project_id: projectId, title: 'API Requests (24h)', value: '48,291', icon: '🔌', updated_at: NOW },
    { project_id: projectId, title: 'Avg Response Time', value: '142ms', icon: '⏱️', updated_at: NOW },
    { project_id: projectId, title: 'Uptime', value: '99.97%', icon: '✅', updated_at: NOW },
  ];

  return {
    exportedAt: new Date().toISOString(),
    projects: [{ id: projectId, name: 'LaunchPad SaaS', created_at: created }],
    categories: categoryRows,
    events: events.sort((a, b) => a.created_at - b.created_at),
    insights,
  };
}

// ── Scenario 3: CI/CD & DevOps (DeployBot) ─────────────────────────────

function generateDevops() {
  const projectId = 'demo-devops';
  const created = ts(30);

  const repos = ['api-server', 'web-app', 'worker-service', 'mobile-app', 'infra-config'];
  const devs = ['sarah', 'james', 'priya', 'marcus', 'chen', 'elena'];
  const envs = ['staging', 'production', 'preview'];

  const categoryNames = ['deployments', 'builds', 'incidents', 'releases', 'monitoring'];
  const categoryRows = categoryNames.map(name => ({ project_id: projectId, name, created_at: created }));
  const events = [];

  for (let day = 29; day >= 0; day--) {
    const deploys = randomBetween(1, 4);
    for (let i = 0; i < deploys; i++) {
      const repo = pick(repos);
      const env = pick(envs);
      const success = Math.random() > 0.12;
      const dev = pick(devs);
      const version = `v${randomBetween(1, 3)}.${randomBetween(0, 15)}.${randomBetween(0, 99)}`;
      const deployId = uid().slice(0, 8);
      events.push({
        project_id: projectId, category: 'deployments',
        title: success ? `Deploy Succeeded` : `Deploy Failed`,
        description: success
          ? `**${repo}** ${version} deployed to **${env}** by ${dev} in ${randomBetween(30, 180)}s`
          : `**${repo}** deploy to **${env}** failed — ${pick(['Build error', 'Health check timeout', 'Migration failed', 'Out of memory'])}`,
        icon: success ? '🚀' : '💥',
        tags: JSON.stringify({ repo, env, version, duration_s: randomBetween(30, 180), status: success ? 'success' : 'failed' }),
        url: `https://ci.example.com/deploybot/${repo}/deploys/${deployId}`,
        user_id: dev, notify: !success ? 1 : 0,
        created_at: ts(day, randomBetween(8, 20), randomBetween(0, 59)),
      });
    }

    const builds = randomBetween(3, 8);
    for (let i = 0; i < builds; i++) {
      const repo = pick(repos);
      const passed = Math.random() > 0.15;
      events.push({
        project_id: projectId, category: 'builds',
        title: passed ? 'Build Passed' : 'Build Failed',
        description: `**${repo}** — ${passed ? `All ${randomBetween(40, 200)} tests passed` : `${randomBetween(1, 5)} tests failed`} (${randomBetween(1, 8)}m ${randomBetween(0, 59)}s)`,
        icon: passed ? '✅' : '❌',
        tags: JSON.stringify({ repo, tests: randomBetween(40, 200), passed }),
        user_id: pick(devs), notify: !passed ? 1 : 0,
        created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (Math.random() > 0.75) {
      const sev = pick(['SEV-1', 'SEV-2', 'SEV-3']);
      const incId = `INC-${uid().slice(0, 6).toUpperCase()}`;
      events.push({
        project_id: projectId, category: 'incidents',
        title: `Incident ${sev}`,
        description: `**${pick(['High latency on API', 'Database connection pool exhausted', 'CDN cache miss spike', 'Memory leak in worker', 'SSL certificate expiring', 'Disk usage at 90%'])}** — ${pick(devs)} is investigating`,
        icon: '🚨',
        tags: JSON.stringify({ severity: sev, status: pick(['investigating', 'identified', 'resolved']) }),
        url: `https://status.example.com/incidents/${incId}`,
        user_id: pick(devs), notify: 1,
        created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (day % 5 === 0) {
      const repo = pick(repos);
      const version = `v${randomBetween(1, 3)}.${randomBetween(0, 9)}.0`;
      events.push({
        project_id: projectId, category: 'releases',
        title: `Release ${version}`,
        description: `**${repo}** ${version} released — ${randomBetween(3, 12)} commits, ${randomBetween(1, 5)} contributors`,
        icon: '🏷️',
        tags: JSON.stringify({ repo, version, commits: randomBetween(3, 12) }),
        user_id: pick(devs), notify: 0,
        created_at: ts(day, 14, randomBetween(0, 59)),
      });
    }

    const monitors = randomBetween(1, 3);
    for (let i = 0; i < monitors; i++) {
      const metric = pick(['CPU', 'Memory', 'Disk', 'Network']);
      const value = randomBetween(20, 95);
      const alert = value > 80;
      events.push({
        project_id: projectId, category: 'monitoring',
        title: alert ? `${metric} Alert` : `${metric} Normal`,
        description: `**${pick(repos)}** — ${metric} at **${value}%** ${alert ? '(threshold: 80%)' : ''}`,
        icon: alert ? '⚠️' : '📊',
        tags: JSON.stringify({ metric, value, threshold: 80, alert }),
        user_id: null, notify: alert ? 1 : 0,
        created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }
  }

  const insights = [
    { project_id: projectId, title: 'Deploy Frequency', value: '4.2/day', icon: '🚀', updated_at: NOW },
    { project_id: projectId, title: 'Build Success Rate', value: '87%', icon: '✅', updated_at: NOW },
    { project_id: projectId, title: 'Mean Time to Recovery', value: '23 min', icon: '⏱️', updated_at: NOW },
    { project_id: projectId, title: 'Open Incidents', value: '2', icon: '🚨', updated_at: NOW },
    { project_id: projectId, title: 'Uptime (30d)', value: '99.94%', icon: '📈', updated_at: NOW },
    { project_id: projectId, title: 'Avg Build Time', value: '4m 12s', icon: '🔨', updated_at: NOW },
  ];

  return {
    exportedAt: new Date().toISOString(),
    projects: [{ id: projectId, name: 'DeployBot', created_at: created }],
    categories: categoryRows,
    events: events.sort((a, b) => a.created_at - b.created_at),
    insights,
  };
}

// ── Scenario 4: Content Platform / Newsletter (BlogWave) ──────────────

function generateContent() {
  const projectId = 'demo-content';
  const created = ts(30);

  const authors = ['flavio', 'maria', 'tom', 'jane', 'alex'];
  const topics = ['JavaScript', 'React', 'Node.js', 'CSS', 'TypeScript', 'Astro', 'Python', 'Git', 'Docker', 'APIs'];
  const newsletters = ['Weekly Digest', 'Pro Tips', 'Deep Dive', 'Launch Announcement'];
  const sources = ['Google', 'Twitter', 'Newsletter', 'Direct', 'Hacker News', 'Reddit', 'LinkedIn'];

  const categoryNames = ['subscribers', 'content', 'engagement', 'newsletter', 'traffic'];
  const categoryRows = categoryNames.map(name => ({ project_id: projectId, name, created_at: created }));
  const events = [];

  let totalSubs = 8420;
  for (let day = 29; day >= 0; day--) {
    const newSubs = randomBetween(5, 25);
    totalSubs += newSubs;
    for (let i = 0; i < Math.min(newSubs, 6); i++) {
      events.push({
        project_id: projectId, category: 'subscribers', title: 'New Subscriber',
        description: `Joined from **${pick(sources)}** — now at **${totalSubs - randomBetween(0, newSubs)}** total`,
        icon: '📬', tags: JSON.stringify({ source: pick(sources), total: totalSubs }),
        user_id: `sub_${uid()}`, notify: 0,
        created_at: ts(day, randomBetween(0, 23), randomBetween(0, 59)),
      });
    }

    if (day % 2 === 0) {
      events.push({
        project_id: projectId, category: 'subscribers', title: 'Subscriber Unsubscribed',
        description: `1 subscriber opted out — reason: ${pick(['Too frequent', 'Not relevant', 'No reason given'])}`,
        icon: '👋', tags: JSON.stringify({ reason: pick(['too_frequent', 'not_relevant', 'none']) }),
        user_id: null, notify: 0,
        created_at: ts(day, randomBetween(8, 20), randomBetween(0, 59)),
      });
    }

    if (day % 3 === 0) {
      const topic = pick(topics);
      const author = pick(authors);
      events.push({
        project_id: projectId, category: 'content', title: 'Article Published',
        description: `"**${randomBetween(5, 15)} ${topic} ${pick(['Tips', 'Tricks', 'Patterns', 'Best Practices', 'Mistakes to Avoid'])}**" by ${author}`,
        icon: '📝',
        tags: JSON.stringify({ topic, author, word_count: randomBetween(800, 3000) }),
        user_id: author, notify: 1,
        created_at: ts(day, randomBetween(6, 10), randomBetween(0, 59)),
      });
    }

    const pageviews = randomBetween(200, 1500);
    events.push({
      project_id: projectId, category: 'engagement', title: 'Daily Page Views',
      description: `**${pageviews.toLocaleString()}** page views — avg session **${randomBetween(1, 6)}m ${randomBetween(0, 59)}s**`,
      icon: '👀', tags: JSON.stringify({ views: pageviews, avg_session_s: randomBetween(60, 360) }),
      user_id: null, notify: 0,
      created_at: ts(day, 23, 55),
    });

    const comments = randomBetween(0, 8);
    for (let i = 0; i < comments; i++) {
      events.push({
        project_id: projectId, category: 'engagement', title: 'New Comment',
        description: `On "**${pick(topics)} ${pick(['Guide', 'Tutorial', 'Deep Dive'])}**"`,
        icon: '💬', tags: JSON.stringify({ topic: pick(topics), moderated: Math.random() > 0.9 }),
        user_id: `user_${uid()}`, notify: 0,
        created_at: ts(day, randomBetween(6, 22), randomBetween(0, 59)),
      });
    }

    if (day % 7 === 0) {
      const nl = pick(newsletters);
      const sent = randomBetween(5000, 9000);
      const opened = Math.round(sent * (randomBetween(30, 55) / 100));
      const clicked = Math.round(opened * (randomBetween(10, 35) / 100));
      events.push({
        project_id: projectId, category: 'newsletter', title: `Newsletter Sent: ${nl}`,
        description: `Sent to **${sent.toLocaleString()}** subscribers — **${Math.round(opened/sent*100)}%** open rate, **${Math.round(clicked/opened*100)}%** click rate`,
        icon: '📨',
        tags: JSON.stringify({ name: nl, sent, opened, clicked, open_rate: Math.round(opened/sent*100), click_rate: Math.round(clicked/opened*100) }),
        user_id: null, notify: 0,
        created_at: ts(day, 9, 0),
      });
    }

    events.push({
      project_id: projectId, category: 'traffic', title: 'Traffic Source Report',
      description: `Top: **${pick(sources)}** (${randomBetween(25, 45)}%), ${pick(sources)} (${randomBetween(10, 25)}%), ${pick(sources)} (${randomBetween(5, 15)}%)`,
      icon: '🌐', tags: JSON.stringify({ top_source: pick(sources) }),
      user_id: null, notify: 0,
      created_at: ts(day, 23, 58),
    });
  }

  const insights = [
    { project_id: projectId, title: 'Total Subscribers', value: totalSubs.toLocaleString(), icon: '📬', updated_at: NOW },
    { project_id: projectId, title: 'Articles Published', value: '42', icon: '📝', updated_at: NOW },
    { project_id: projectId, title: 'Avg Open Rate', value: '42.3%', icon: '📨', updated_at: NOW },
    { project_id: projectId, title: 'Monthly Page Views', value: '28,491', icon: '👀', updated_at: NOW },
    { project_id: projectId, title: 'Subscriber Growth', value: '+12.4%', icon: '📈', updated_at: NOW },
    { project_id: projectId, title: 'Avg Read Time', value: '4m 30s', icon: '⏱️', updated_at: NOW },
  ];

  return {
    exportedAt: new Date().toISOString(),
    projects: [{ id: projectId, name: 'BlogWave', created_at: created }],
    categories: categoryRows,
    events: events.sort((a, b) => a.created_at - b.created_at),
    insights,
  };
}

// ── Generate all ────────────────────────────────────────────────────────

const scenarios = [
  { name: 'ecommerce', gen: generateEcommerce },
  { name: 'saas', gen: generateSaas },
  { name: 'devops', gen: generateDevops },
  { name: 'content', gen: generateContent },
];

let allInOne = { exportedAt: new Date().toISOString(), projects: [], categories: [], events: [], insights: [] };

for (const { name, gen } of scenarios) {
  const data = gen();
  const file = join(__dirname, `${name}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`${name}.json — ${data.events.length} events, ${data.insights.length} insights`);
  allInOne.projects.push(...data.projects);
  allInOne.categories.push(...data.categories);
  allInOne.events.push(...data.events);
  allInOne.insights.push(...data.insights);
}

allInOne.events.sort((a, b) => a.created_at - b.created_at);
const allFile = join(__dirname, 'all-scenarios.json');
writeFileSync(allFile, JSON.stringify(allInOne, null, 2));
console.log(`\nall-scenarios.json — ${allInOne.events.length} events total across ${allInOne.projects.length} projects`);
console.log('\nTo load a scenario:');
console.log('  node cli/index.js load --file demos/ecommerce.json');
console.log('  node cli/index.js load --file demos/all-scenarios.json');
