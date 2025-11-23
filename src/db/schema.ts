import { integer, pgTable, varchar, timestamp, text, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullname: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const searchesTable = pgTable("searches", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id").notNull().references(() => usersTable.id),
  query: varchar({ length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const articlesTable = pgTable("articles",{
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  search_id: integer().notNull().references(() => searchesTable.id),
  title: text("title").notNull(),
  url: text("url").notNull(),
  authors: text("authors").notNull(),
  publishedAt: timestamp("published_at"),
  summary: text("summary"),
  annotations: text("annotations"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => usersTable.id),
  articleId: uuid("article_id").references(() => articlesTable.id),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

