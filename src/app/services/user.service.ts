import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private supabaseService: SupabaseService) {}

  async addUser(data: any, imagen1?: File, imagen2?: File) {
    try {
      const userId = data.id;

      if (imagen1) {
        const ext1 = imagen1.name.split('.').pop();
        const path1 = `avatars/${userId}_1_${Date.now()}.${ext1}`;
        await this.supabaseService.uploadFile('avatars', path1, imagen1);
        data.imagen1 = this.supabaseService.getPublicUrl('avatars', path1);
      }

      if (imagen2) {
        const ext2 = imagen2.name.split('.').pop();
        const path2 = `avatars/${userId}_2_${Date.now()}.${ext2}`;
        await this.supabaseService.uploadFile('avatars', path2, imagen2);
        data.imagen2 = this.supabaseService.getPublicUrl('avatars', path2);
      }

      const { error } = await this.supabaseService.supabase
        .from('usuarios')
        .insert([data]);
      if (error) throw error;
    } catch (err) {
      throw err;
    }
  }

  async getAllUsers() {
    const { data, error } = await this.supabaseService.supabase
      .from('usuarios')
      .select('*');
    if (error) throw error;
    return data;
  }

  async updateUser(id: string, updates: any) {
    const { error } = await this.supabaseService.supabase
      .from('usuarios')
      .update(updates)
      .eq('id', id);
    if (error) throw error;
  }
}
