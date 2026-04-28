/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as functions_conversations_mutations from "../functions/conversations/mutations.js";
import type * as functions_conversations_queries from "../functions/conversations/queries.js";
import type * as functions_messages_mutations from "../functions/messages/mutations.js";
import type * as functions_messages_queries from "../functions/messages/queries.js";
import type * as functions_users_mutations from "../functions/users/mutations.js";
import type * as functions_users_queries from "../functions/users/queries.js";
import type * as lib_helpers from "../lib/helpers.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "functions/conversations/mutations": typeof functions_conversations_mutations;
  "functions/conversations/queries": typeof functions_conversations_queries;
  "functions/messages/mutations": typeof functions_messages_mutations;
  "functions/messages/queries": typeof functions_messages_queries;
  "functions/users/mutations": typeof functions_users_mutations;
  "functions/users/queries": typeof functions_users_queries;
  "lib/helpers": typeof lib_helpers;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
