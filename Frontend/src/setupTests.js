import '@testing-library/jest-dom';

jest.mock('@supabase/supabase-js', () => ({
  createClient: (url, key) => {
    return {
      from: jest.fn(() => ({ select: jest.fn() })),
      auth: {
        signIn: jest.fn(),
        signOut: jest.fn()
      }
    };
  },
}));

jest.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => children,
  GoogleLogin: () => null,
}));
