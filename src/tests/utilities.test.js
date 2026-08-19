import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../App', () => ({ API: 'http://api.test' }));

const { fetchProfileInfo, fetchSublevels, logout } = await import('../profile/utilties.js');
const { BuyCoins } = await import('../payments/utilties.js');
const { getPreviousConvirsation } = await import('../subl-level/utlities.js');

function response(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('frontend API utilities', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the signed-in profile data', async () => {
    const profile = { remainingMessagesCount: 10 };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ profile, user: { username: 'Learner' } })));

    await expect(fetchProfileInfo()).resolves.toEqual({ profile, user: { username: 'Learner' } });
  });

  it('maps an unauthorized profile request to the login redirect reason', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, { ok: false, status: 401 })));

    await expect(fetchProfileInfo()).resolves.toEqual({ transferReason: 'must login first' });
  });

  it('requests older conversation history with its cursor and returns pagination metadata', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({
      messages: [{ role: 'user', message: 'Hello', feedBack: 'Good' }],
      nextBefore: 8,
      hasMore: true,
    }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(getPreviousConvirsation('sub-level-id', 18)).resolves.toEqual({
      messages: [{ role: 'user', message: 'Hello', feedBack: 'Good' }],
      nextBefore: 8,
      hasMore: true,
    });
    expect(fetchMock.mock.calls[0][0]).toContain('subLevel=sub-level-id&before=18');
  });

  it('returns sub-level pagination data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ subLevels: [{ number: 1 }], hasMore: false })));

    await expect(fetchSublevels(1, 'level-id')).resolves.toEqual({ subLevels: [{ number: 1 }], hasMore: false });
  });

  it('posts the requested coin amount', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response({ checkoutUrl: 'https://checkout.test' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(BuyCoins(100)).resolves.toEqual({ data: { checkoutUrl: 'https://checkout.test' } });
    expect(fetchMock.mock.calls[0][1].body).toBe(JSON.stringify({ coins: 100 }));
  });

  it('returns the existing logout success value', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({})));

    await expect(logout()).resolves.toBe('done');
  });
});
