import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userEmailSubject = new BehaviorSubject<string | null>(null);
  public userEmail$ = this.userEmailSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string | null>(null);
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  async signUp(email: string, password: string) {
    return this.supabaseService.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    const result = await this.supabaseService.supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;

    const user = result.data?.user;
    const userEmail = user?.email ?? null;

    if (userEmail) {
      this.userEmailSubject.next(userEmail);
      localStorage.setItem('loggedInUserEmail', userEmail);
    }

    return result;
  }

  setUserRole(role: string | null) {
    this.userRoleSubject.next(role);
    if (role) {
      localStorage.setItem('loggedInUserRole', role);
    } else {
      localStorage.removeItem('loggedInUserRole');
    }
  }

  async signOut() {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) throw error;

    this.userEmailSubject.next(null);
    this.userRoleSubject.next(null);
    localStorage.removeItem('loggedInUserEmail');
    localStorage.removeItem('loggedInUserRole');
  }

  getUserIdFromSignUpResult(result: any): string | null {
    return result?.data?.user?.id ?? null;
  }

  getUser() {
    return this.supabaseService.supabase.auth.getUser();
  }

  getSession() {
    return this.supabaseService.supabase.auth.getSession();
  }
  
}