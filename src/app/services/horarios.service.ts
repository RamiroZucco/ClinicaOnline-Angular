import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  constructor(private supabase: SupabaseService) {}

  async obtenerHorariosPorEspecialista(especialistaId: string) {
    const { data, error } = await this.supabase.supabase
      .from('horarios')
      .select('*')
      .eq('especialista_id', especialistaId);

    if (error) throw error;
    return data;
  }

  async insertarHorario(data: any) {
    const { error } = await this.supabase.supabase
      .from('horarios')
      .insert([data]);
    if (error) throw error;
  }

  async deleteHorariosDeEspecialista(especialistaId: string) {
    const { error } = await this.supabase.supabase
      .from('horarios')
      .delete()
      .eq('especialista_id', especialistaId);
    if (error) throw error;
  }

}
