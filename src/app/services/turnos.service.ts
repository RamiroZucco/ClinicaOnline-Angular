import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class TurnosService {
  constructor(private supabase: SupabaseService) {}

  async crearTurno(turno: any) {
    const { error } = await this.supabase.supabase
      .from('turnos')
      .insert([turno]);
    if (error) throw error;
  }

  async obtenerTurnosPorUsuario(id: string, rol: string) {
    const col = rol === 'paciente' ? 'paciente_id' : 'especialista_id';
    const { data, error } = await this.supabase.supabase
      .from('turnos')
      .select(`
        *,
        paciente:usuarios!paciente_id(nombre, apellido),
        especialista:usuarios!especialista_id(nombre, apellido)
      `)
      .eq(col, id);
    if (error) throw error;
    return data;
  }

  async obtenerTurnosDelPaciente(pacienteId: string) {
    const { data, error } = await this.supabase.supabase
      .from('turnos')
      .select(`
        *,
        especialista:usuarios!especialista_id(nombre, apellido)
      `)
      .eq('paciente_id', pacienteId);

    if (error) throw error;
    return data;
  }

  async obtenerTodos() {
    const { data, error } = await this.supabase.supabase
      .from('turnos')
      .select(`
        *,
        especialista:usuarios!especialista_id(nombre, apellido, especialidades),
        paciente:usuarios!paciente_id(nombre, apellido, email)
      `);
    if (error) throw error;
    return data;
  }

  async actualizarTurno(id: string, update: any) {
    const { error } = await this.supabase.supabase
      .from('turnos')
      .update(update)
      .eq('id', id);
    if (error) throw error;
  }

  async getHorariosDelEspecialista(especialista_id: string, especialidad: string) {
    const { data, error } = await this.supabase.supabase
      .from('horarios')
      .select('*')
      .eq('especialista_id', especialista_id)
      .eq('especialidad', especialidad);

    if (error) throw error;
    return data;
  }


  
}
