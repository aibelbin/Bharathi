import { relations } from "drizzle-orm/relations";
import { user, account, session, context } from "./schema";

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	accounts: many(account),
	sessions: many(session),
	contexts: many(context),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const contextRelations = relations(context, ({one}) => ({
	user: one(user, {
		fields: [context.companyId],
		references: [user.id]
	}),
}));