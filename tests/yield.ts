import { beforeEach } from 'vitest';
// Sync tests run back to back without a macrotask turn, so a worker's pending RPC reply waits behind them and times out after 60 s
// ("Timeout calling onTaskUpdate"). One timer turn before each test lets the replies through.
beforeEach(() => new Promise<void>(r => setTimeout(r, 0)));
