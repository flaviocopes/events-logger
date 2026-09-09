#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const program = new Command();
const DEFAULT_URL = 'http://localhost:4321';

program
  .name('events-cli')
  .description('Push events and insights to your Events Dashboard')
  .version('1.0.0');

program
  .command('init')
  .description('Create a new project')
  .requiredOption('--api-key <key>', 'API key')
  .requiredOption('--name <name>', 'Project name')
  .option('--url <url>', 'Server URL', DEFAULT_URL)
  .action(async (opts) => {
    try {
      const res = await fetch(`${opts.url}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${opts.apiKey}` },
        body: JSON.stringify({ name: opts.name }),
      });
      if (!res.ok) { const err = await res.json(); console.error('Error:', err.error || res.statusText); process.exit(1); }
      const data = await res.json();
      console.log(`Project created: ${data.name}`);
      console.log(`ID: ${data.id}`);
      console.log('');
      console.log('Push events with:');
      console.log(`  events-cli push --api-key ${opts.apiKey} --project ${data.id} --category signups --title "User Registered"`);
    } catch (err) {
      console.error(`Could not connect to ${opts.url}. Is the server running?`);
      process.exit(1);
    }
  });

program
  .command('push')
  .description('Push an event')
  .requiredOption('--api-key <key>', 'API key')
  .requiredOption('--project <id>', 'Project ID')
  .requiredOption('--category <category>', 'Event category')
  .requiredOption('--title <title>', 'Event title')
  .option('--description <desc>', 'Event description')
  .option('--icon <icon>', 'Emoji icon')
  .option('--tags <json>', 'Tags as JSON object')
  .option('--user-id <id>', 'User ID to associate with the event')
  .option('--notify', 'Mark as notification')
  .option('--action-url <actionUrl>', 'Link to external resource (e.g. order page)')
  .option('--url <url>', 'Server URL', DEFAULT_URL)
  .action(async (opts) => {
    const body = {
      project: opts.project,
      category: opts.category, title: opts.title, description: opts.description,
      icon: opts.icon, tags: opts.tags ? JSON.parse(opts.tags) : undefined,
      url: opts.actionUrl || undefined,
      user_id: opts.userId, notify: opts.notify || false,
    };
    try {
      const res = await fetch(`${opts.url}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${opts.apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); console.error('Error:', err.error || res.statusText); process.exit(1); }
      const event = await res.json();
      console.log(`Event pushed: ${event.title} [${event.category}]`);
    } catch (err) {
      console.error(`Could not connect to ${opts.url}. Is the server running?`);
      process.exit(1);
    }
  });

program
  .command('insight')
  .description('Create or update an insight')
  .requiredOption('--api-key <key>', 'API key')
  .requiredOption('--project <id>', 'Project ID')
  .requiredOption('--title <title>', 'Insight title')
  .requiredOption('--value <value>', 'Insight value')
  .option('--icon <icon>', 'Emoji icon')
  .option('--url <url>', 'Server URL', DEFAULT_URL)
  .action(async (opts) => {
    const body = { project: opts.project, title: opts.title, value: opts.value, icon: opts.icon };
    try {
      const res = await fetch(`${opts.url}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${opts.apiKey}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const err = await res.json(); console.error('Error:', err.error || res.statusText); process.exit(1); }
      console.log(`Insight updated: ${opts.title} = ${opts.value}`);
    } catch (err) {
      console.error(`Could not connect to ${opts.url}. Is the server running?`);
      process.exit(1);
    }
  });

program
  .command('export')
  .description('Export all data to a JSON file')
  .option('--file <path>', 'Output file path', 'export.json')
  .option('--db <path>', 'Database path', join(process.cwd(), 'data', 'events.db'))
  .action(async (opts) => {
    const Database = (await import('better-sqlite3')).default;
    if (!existsSync(opts.db)) { console.error(`Database not found at ${opts.db}`); process.exit(1); }
    const db = new Database(opts.db, { readonly: true });
    const data = {
      exportedAt: new Date().toISOString(),
      projects: db.prepare('SELECT * FROM projects').all(),
      categories: db.prepare('SELECT * FROM categories').all(),
      events: db.prepare('SELECT * FROM events ORDER BY created_at ASC').all(),
      insights: db.prepare('SELECT * FROM insights').all(),
    };
    db.close();
    writeFileSync(opts.file, JSON.stringify(data, null, 2));
    console.log(`Exported to ${opts.file}`);
    console.log(`  ${data.projects.length} projects, ${data.categories.length} categories, ${data.events.length} events, ${data.insights.length} insights`);
  });

program
  .command('load')
  .description('Load data from a JSON file (replaces all existing data)')
  .requiredOption('--file <path>', 'JSON file to load')
  .option('--db <path>', 'Database path', join(process.cwd(), 'data', 'events.db'))
  .option('--merge', 'Merge with existing data instead of replacing')
  .action(async (opts) => {
    if (!existsSync(opts.file)) { console.error(`File not found: ${opts.file}`); process.exit(1); }
    const Database = (await import('better-sqlite3')).default;
    const db = new Database(opts.db);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = OFF');

    db.exec(`CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at INTEGER NOT NULL)`);
    db.exec(`CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, name TEXT NOT NULL, created_at INTEGER NOT NULL, UNIQUE(project_id, name))`);
    db.exec(`CREATE TABLE IF NOT EXISTS events (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, category TEXT NOT NULL, title TEXT NOT NULL, description TEXT, icon TEXT, tags TEXT, url TEXT, user_id TEXT, notify INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`);
    db.exec(`CREATE TABLE IF NOT EXISTS insights (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id TEXT NOT NULL, title TEXT NOT NULL, value TEXT NOT NULL, icon TEXT, updated_at INTEGER NOT NULL, UNIQUE(project_id, title))`);
    try { db.exec('ALTER TABLE events ADD COLUMN user_id TEXT'); } catch(_) {}
    try { db.exec('ALTER TABLE events ADD COLUMN url TEXT'); } catch(_) {}

    const raw = readFileSync(opts.file, 'utf-8');
    const data = JSON.parse(raw);

    const tx = db.transaction(() => {
      if (!opts.merge) {
        db.exec('DELETE FROM events');
        db.exec('DELETE FROM insights');
        db.exec('DELETE FROM categories');
        db.exec('DELETE FROM projects');
      }

      const insertProject = db.prepare('INSERT OR REPLACE INTO projects (id, name, created_at) VALUES (?, ?, ?)');
      for (const p of data.projects) {
        insertProject.run(p.id, p.name, p.created_at);
      }

      const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (project_id, name, created_at) VALUES (?, ?, ?)');
      for (const c of data.categories) {
        insertCategory.run(c.project_id, c.name, c.created_at);
      }

      const insertEvent = db.prepare('INSERT INTO events (project_id, category, title, description, icon, tags, url, user_id, notify, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
      for (const e of data.events) {
        insertEvent.run(e.project_id, e.category, e.title, e.description, e.icon, e.tags, e.url || null, e.user_id, e.notify, e.created_at);
      }

      const insertInsight = db.prepare('INSERT OR REPLACE INTO insights (project_id, title, value, icon, updated_at) VALUES (?, ?, ?, ?, ?)');
      for (const i of data.insights) {
        insertInsight.run(i.project_id, i.title, i.value, i.icon, i.updated_at);
      }
    });

    tx();
    db.pragma('foreign_keys = ON');
    db.close();

    console.log(`Loaded from ${opts.file}`);
    console.log(`  ${data.projects.length} projects, ${data.categories.length} categories, ${data.events.length} events, ${data.insights.length} insights`);
    console.log('Restart the dev server to see the changes.');
  });

program.parse();
