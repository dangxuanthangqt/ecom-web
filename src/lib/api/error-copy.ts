import type en from "../../../messages/en.json";

import type { ApiErrorCode } from "./types";

/**
 * Holds the error copy against the codes the API actually publishes.
 *
 * `messages/*.json` is a second catalogue of the same codes, kept in another
 * repo's shape, so the two drift the moment a code is renamed. This is the
 * tripwire: the assignment below stops compiling if `errors` names something
 * the generated schema does not know, which is what a rename or a typo looks
 * like from here.
 *
 * It deliberately does not assert the other direction. A published code with no
 * copy yet is fine — `resolveApiErrorMessage` falls back to the API's own text —
 * and the published union also carries the status-derived codes (`OK`,
 * `CONTINUE`, …) that no customer ever reads.
 */
type CopiedErrorCode = keyof (typeof en)["errors"];

type UnpublishedCopy = Exclude<CopiedErrorCode, ApiErrorCode>;

/**
 * Fails to satisfy its own constraint the moment `UnpublishedCopy` is anything
 * but `never`, and the compiler names the offending key in the error.
 */
type AssertNoUnpublishedCopy<T extends never> = T;

export type ErrorCopyIsPublished = AssertNoUnpublishedCopy<UnpublishedCopy>;
