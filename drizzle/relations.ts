import { relations } from "drizzle-orm/relations";
import { company, account, session, user, context } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	company: one(company, {
		fields: [account.userId],
		references: [company.id]
	}),
}));

export const companyRelations = relations(company, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	users: many(user),
	contexts: many(context),
}));

export const sessionRelations = relations(session, ({one}) => ({
	company: one(company, {
		fields: [session.userId],
		references: [company.id]
	}),
}));

export const userRelations = relations(user, ({one}) => ({
	company: one(company, {
		fields: [user.companyId],
		references: [company.id]
	}),
}));

export const contextRelations = relations(context, ({one}) => ({
	company: one(company, {
		fields: [context.companyId],
		references: [company.id]
	}),
}));