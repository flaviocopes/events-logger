import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core'

export const appSettings = sqliteTable('app_settings', {
  id: integer('id').primaryKey(),
  apiKey: text('api_key').notNull(),
})

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const categories = sqliteTable(
  'categories',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    name: text('name').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('category_project_name').on(table.projectId, table.name),
  ]
)

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: text('project_id')
    .notNull()
    .references(() => projects.id),
  category: text('category').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  icon: text('icon'),
  tags: text('tags'),
  url: text('url'),
  userId: text('user_id'),
  notify: integer('notify', { mode: 'boolean' }).notNull().default(false),
  favorited: integer('favorited', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const insights = sqliteTable(
  'insights',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id),
    title: text('title').notNull(),
    value: text('value').notNull(),
    icon: text('icon'),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [
    uniqueIndex('insight_project_title').on(table.projectId, table.title),
  ]
)
