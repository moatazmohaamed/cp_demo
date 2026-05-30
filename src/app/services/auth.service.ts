import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const SESSION_KEY = 'dx_auth';
const REMEMBER_KEY = 'dx_remember';

const VALID_USERNAME = 'shrouk';
const VALID_PASSWORD = 'Sam1@234';
const username= ''


@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private router: Router) {}

  login(username: string, password: string, rememberMe = false): boolean {
    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
      const payload = JSON.stringify({ username, ts: Date.now() });
      sessionStorage.setItem(SESSION_KEY, payload);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, payload);
        // Store credentials obfuscated — demo only, not real security
        localStorage.setItem(REMEMBER_KEY, btoa(JSON.stringify({ username, password })));
      } else {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
      }
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!(
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY)
    );
  }

  getUsername(): string | null {
    const raw =
      sessionStorage.getItem(SESSION_KEY) ||
      localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw).username ?? null;
    } catch {
      return null;
    }
  }

  getRememberedCredentials(): { username: string; password: string } | null {
    const raw = localStorage.getItem(REMEMBER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(atob(raw));
    } catch {
      return null;
    }
  }
}
