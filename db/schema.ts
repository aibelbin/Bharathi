import { relations } from "drizzle-orm";
import { pgTable, text, foreignKey, timestamp, uuid, boolean, index, integer } from "drizzle-orm/pg-core";

export const company = pgTable("company", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  phone: text("phone").notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const companyRelations = relations(company, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  users: many(user),
  contexts: many(context),
  callLogs: many(callLog),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  company: one(company, {
    fields: [session.userId],
    references: [company.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  company: one(company, {
    fields: [account.userId],
    references: [company.id],
  }),
}));

export const context = pgTable("context", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  companyName: text("company_name").notNull(),
  description: text().notNull(),
  companyId: text("company_id"),
  isDeliveriable: boolean("is_deliveriable"),
  deliveryPhone: text("delivery_phone"),
}, (table) => [
  foreignKey({
      columns: [table.companyId],
      foreignColumns: [company.id],
      name: "context_company_id_fkey"
    }),
]);


export const user = pgTable("user", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  companyId: text("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
}, (table) => [
  index("user_companyId_idx").on(table.companyId),
]);

export const contextRelations = relations(context, ({ one }) => ({
  company: one(company, {
    fields: [context.companyId],
    references: [company.id],
  }),
}));

export const userRelations = relations(user, ({ one, many }) => ({
  company: one(company, {
    fields: [user.companyId],
    references: [company.id],
  }),
  callLogs: many(callLog),
}));

export const callLog = pgTable("call_log", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  summary: text("summary").notNull(),
  duration: integer("duration"),
  status: text("status").notNull().default("completed"),
  callerPhone: text("caller_phone"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
}, (table) => [
  index("callLog_userId_idx").on(table.userId),
  index("callLog_companyId_idx").on(table.companyId),
]);

export const callLogRelations = relations(callLog, ({ one }) => ({
  user: one(user, {
    fields: [callLog.userId],
    references: [user.id],
  }),
  company: one(company, {
    fields: [callLog.companyId],
    references: [company.id],
  }),
}));
