/** Stable error codes (documented in docs/errors.md). Message always names the pack/file responsible when known. */
export type ErrorCode =
  | 'E_PACK_DUP' | 'E_PACK_MISSING_DEP' | 'E_PACK_VERSION' | 'E_PACK_CYCLE' | 'E_PACK_OVERRIDE'
  | 'E_CONTENT_DUP' | 'E_CONTENT_TYPE' | 'E_ORDER_CYCLE'
  | 'E_EVENT_DEPTH' | 'E_EVENT_UNKNOWN' | 'E_HOOK_FAIL' | 'E_SYSTEM_FAIL'
  | 'E_SANITIZER' | 'E_HANDLE_FULL' | 'E_REPLAY' | 'E_STATE';

export class KernelError extends Error {
  constructor(readonly code: ErrorCode, message: string) { super(`[${code}] ${message}`); this.name = 'KernelError'; }
}
