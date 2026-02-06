/**
 * Authentication service using Google Identity Services.
 * Manages Google ID token lifecycle for API write operations.
 */

const TOKEN_STORAGE_KEY = 'virtual-cv-auth-token';
const USER_STORAGE_KEY = 'virtual-cv-auth-user';

export interface AuthUser {
  email: string;
  name: string;
  picture: string;
}

type AuthChangeCallback = (user: AuthUser | null) => void;

class AuthService {
  private token: string | null = null;
  private user: AuthUser | null = null;
  private listeners: Set<AuthChangeCallback> = new Set();

  constructor() {
    this.restoreSession();
  }

  /** Get the current ID token, or null if not authenticated. */
  getToken(): string | null {
    if (this.token && this.isTokenExpired(this.token)) {
      this.clearAuth();
      return null;
    }
    return this.token;
  }

  /** Get the current user, or null. */
  getUser(): AuthUser | null {
    if (this.token && this.isTokenExpired(this.token)) {
      this.clearAuth();
      return null;
    }
    return this.user;
  }

  /** Check if user is currently authenticated with a valid token. */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  /** Handle successful Google Sign-In credential response. */
  handleCredentialResponse(credential: string): void {
    const payload = this.decodeJwtPayload(credential);

    this.token = credential;
    this.user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    sessionStorage.setItem(TOKEN_STORAGE_KEY, credential);
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user));

    this.notifyListeners();
  }

  /** Sign out and clear stored auth state. */
  signOut(): void {
    this.clearAuth();
  }

  /** Subscribe to auth state changes. Returns unsubscribe function. */
  onAuthChange(callback: AuthChangeCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private restoreSession(): void {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
    if (storedToken && storedUser && !this.isTokenExpired(storedToken)) {
      this.token = storedToken;
      this.user = JSON.parse(storedUser);
    } else {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  private clearAuth(): void {
    this.token = null;
    this.user = null;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
    this.notifyListeners();
  }

  private notifyListeners(): void {
    for (const cb of this.listeners) {
      cb(this.user);
    }
  }

  /** Decode JWT payload without verification (verification is backend's job). */
  private decodeJwtPayload(token: string): Record<string, string> {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  }

  /** Check if a JWT is expired (with 5-minute buffer). */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeJwtPayload(token);
      const exp = Number(payload.exp);
      const nowSeconds = Math.floor(Date.now() / 1000);
      return nowSeconds >= exp - 300;
    } catch {
      return true;
    }
  }
}

export const authService = new AuthService();
