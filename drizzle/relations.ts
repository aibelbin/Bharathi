import { relations } from "drizzle-orm/relations";
import { company, context, account, session, user, callLog, userCompanyMessages, companyEmbeddings } from "./schema";

export const contextRelations = relations(context, ({one}) => ({
	company: one(company, {
		fields: [context.companyId],
		references: [company.id]
	}),
}));

export const companyRelations = relations(company, ({many}) => ({
	contexts: many(context),
	accounts: many(account),
	sessions: many(session),
	users: many(user),
	callLogs: many(callLog),
	userCompanyMessages: many(userCompanyMessages),
	companyEmbeddings: many(companyEmbeddings),
}));

export const accountRelations = relations(account, ({one}) => ({
	company: one(company, {
		fields: [account.userId],
		references: [company.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	company: one(company, {
		fields: [session.userId],
		references: [company.id]
	}),
}));

export const userRelations = relations(user, ({one, many}) => ({
	company: one(company, {
		fields: [user.companyId],
		references: [company.id]
	}),
	callLogs: many(callLog),
	userCompanyMessages: many(userCompanyMessages),
}));

export const callLogRelations = relations(callLog, ({one}) => ({
	company: one(company, {
		fields: [callLog.companyId],
		references: [company.id]
	}),
	user: one(user, {
		fields: [callLog.userId],
		references: [user.id]
	}),
}));

export const userCompanyMessagesRelations = relations(userCompanyMessages, ({one}) => ({
	company: one(company, {
		fields: [userCompanyMessages.companyId],
		references: [company.id]
	}),
	user: one(user, {
		fields: [userCompanyMessages.userId],
		references: [user.id]
	}),
}));

export const companyEmbeddingsRelations = relations(companyEmbeddings, ({one}) => ({
	company: one(company, {
		fields: [companyEmbeddings.companyId],
		references: [company.id]
	}),
}));