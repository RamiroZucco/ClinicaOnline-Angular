import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { TurnosService } from '../../services/turnos.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css'],
  imports: [CommonModule,FormsModule]
})
export class MiPerfilComponent implements OnInit {
  usuario: any;
  turnos: any[] = [];
  historiaClinica: any[] = [];
  especialidades: string[] = [];
  especialidadSeleccionada: string = '';

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {
    const session = await this.authService.getSession();
    const email = session.data.session?.user.email;
    const users = await this.userService.getAllUsers();
    this.usuario = users.find(u => u.email === email);

    if (this.usuario && this.usuario.rol === 'paciente') {
      this.turnos = await this.turnosService.obtenerTurnosPorUsuario(this.usuario.id, 'paciente');
      this.historiaClinica = this.turnos.filter(t => t.estado === 'realizado');
      this.especialidades = [
        ...new Set(this.historiaClinica.map(t => t.especialidad))
      ];
    }
  }

  getHistoriaFiltrada() {
    if (!this.especialidadSeleccionada) return this.historiaClinica;
    return this.historiaClinica.filter(t => t.especialidad === this.especialidadSeleccionada);
  }

  async generarPDF(historia: any[], titulo: string) {
    const doc = new jsPDF();

    const logo = await this.getBase64ImageFromUrl('assets/logo.png');

    doc.addImage(logo, 'PNG', 14, 8, 22, 22);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(titulo, 42, 20);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Paciente: ' + this.usuario.nombre + ' ' + this.usuario.apellido, 14, 38);
    doc.text('DNI: ' + this.usuario.dni, 90, 38);
    doc.text('Fecha de emisión: ' + new Date().toLocaleString(), 14, 45);

    const tableData = historia.map(t => {
      const extra = t.extra_dinamico
        ? Object.entries(t.extra_dinamico)
            .map(([k, v]) => `${k}: ${v}`).join('\n')
        : '';
      return [
        t.fecha,
        t.hora,
        t.especialidad,
        t.altura ?? '-',
        t.peso ?? '-',
        t.temperatura ?? '-',
        t.presion ?? '-',
        t.comentario_especialista ?? '-',
        extra || '-'
      ];
    });

    autoTable(doc, {
      head: [[
        'Fecha', 'Hora', 'Especialidad', 'Altura', 'Peso', 'Temp.', 'Presión', 'Comentario', 'Campos Dinámicos'
      ]],
      body: tableData,
      startY: 52,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [9, 15, 82] }
    });

    doc.save('historia_clinica_' + this.usuario.apellido + '.pdf');
  }

  async getBase64ImageFromUrl(imageUrl: string): Promise<string> {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return await this.convertBlobToBase64(blob) as string;
  }
  convertBlobToBase64(blob: Blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  descargarHistoriaCompleta() {
    this.generarPDF(this.historiaClinica, 'Historia Clínica Completa');
  }
  descargarHistoriaPorEspecialidad() {
    if (!this.especialidadSeleccionada) return;
    this.generarPDF(
      this.getHistoriaFiltrada(),
      `Historia Clínica - ${this.especialidadSeleccionada}`
    );
  }

  getExtraArray(extra: any): { clave: string, valor: string }[] {
    if (!extra) return [];
    return Object.entries(extra).map(
      ([clave, valor]) => ({ clave, valor: String(valor) })
    );
  }
}
