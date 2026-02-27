import { pgTable, foreignKey, uuid, timestamp, text, boolean, index, unique, integer, date, bigint, vector, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const context = pgTable("context", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	companyName: text("company_name").notNull(),
	description: text().notNull(),
	companyId: text("company_id"),
	isDeliverable: boolean("is_deliverable"),
	deliveryPhone: text("delivery_phone"),
	content: text(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "context_company_id_fkey"
		}),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [company.id],
			name: "account_user_id_company_id_fk"
		}).onDelete("cascade"),
]);

export const company = pgTable("company", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	phone: text().notNull(),
	cost: text().default('0'),
	totalToken: text("total_token").default('0'),
}, (table) => [
	unique("company_email_unique").on(table.email),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast().op("text_ops")),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [company.id],
			name: "session_user_id_company_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	phone: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	companyId: text("company_id").notNull(),
}, (table) => [
	index("user_companyId_idx").using("btree", table.companyId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "user_company_id_company_id_fk"
		}).onDelete("cascade"),
]);

export const callLog = pgTable("call_log", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	summary: text().notNull(),
	duration: integer(),
	status: text().default('completed').notNull(),
	callerPhone: text("caller_phone"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	userId: uuid("user_id").notNull(),
	companyId: text("company_id").notNull(),
}, (table) => [
	index("callLog_companyId_idx").using("btree", table.companyId.asc().nullsLast().op("text_ops")),
	index("callLog_userId_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "call_log_company_id_company_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "call_log_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const userCompanyMessages = pgTable("user_company_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: date("created_at").defaultNow(),
	companyId: text("company_id").notNull(),
	message: text(),
	userId: uuid("user_id"),
	isAgent: boolean("is_agent"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "user_company_messages_company_id_fkey"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "user_company_messages_user_id_fkey"
		}).onDelete("cascade"),
]);

export const socialAccounts = pgTable("social_accounts", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "social_accounts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	companyId: text("company_id"),
	facebookAccessToken: text("facebook_access_token"),
	instagramAccessToken: text("instagram_access_token"),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "social_accounts_company_id_fkey"
		}).onDelete("cascade"),
]);

export const companyEmbeddings = pgTable("company_embeddings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	content: text(),
	embedding: vector({ dimensions: 3072 }),
	metadata: jsonb(),
	companyId: text("company_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.companyId],
			foreignColumns: [company.id],
			name: "company_embeddings_company_id_fkey"
		}).onDelete("cascade"),
]);
