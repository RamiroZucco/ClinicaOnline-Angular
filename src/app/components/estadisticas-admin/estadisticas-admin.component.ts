import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { ChartType, ChartOptions, ChartData } from 'chart.js';
import { SupabaseService } from '../../services/supabase.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-estadisticas-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgChartsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './estadisticas-admin.component.html',
  styleUrls: ['./estadisticas-admin.component.css'],
})
export class EstadisticasAdminComponent implements OnInit {
  tabSeleccionado = 'log';

  logs: any[] = [];
  cargandoLogs = false;

  cargandoTurnosEspecialidad = false;
  especialidadLabels: string[] = [];
  especialidadCounts: number[] = [];
  barChartType: ChartType = 'bar';
  barChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false, labels: { color: '#222' } },
      title: { display: true, text: 'Cantidad de turnos por especialidad', color: '#222', font: { size: 20, weight: 'bold' } }
    },
    scales: {
      x: { ticks: { color: '#222', font: { weight: 'bold' } }, grid: { color: '#e1e1ee' } },
      y: { beginAtZero: true, ticks: { color: '#222', font: { weight: 'bold' } }, grid: { color: '#e1e1ee' } }
    }
  };
  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Turnos',
      backgroundColor: '#1976d2',
      hoverBackgroundColor: '#0d47a1'
    }]
  };

  cargandoTurnosPorDia = false;
  diaLabels: string[] = [];
  diaCounts: number[] = [];
  lineChartType: ChartType = 'line';
  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Turnos por día',
      borderColor: '#1976d2',
      backgroundColor: 'rgba(33,118,255,0.13)',
      pointBackgroundColor: '#1976d2',
      pointBorderColor: '#1976d2',
      tension: 0.38,
      fill: true
    }]
  };
  lineChartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false, labels: { color: '#222' } },
      title: { display: true, text: 'Cantidad de turnos por día', color: '#222', font: { size: 19, weight: 'bold' } }
    },
    scales: {
      x: { title: { display: true, text: 'Fecha', color: '#222' }, ticks: { color: '#222', font: { weight: 'bold' } }, grid: { color: '#e1e1ee' } },
      y: { beginAtZero: true, title: { display: true, text: 'Turnos', color: '#222' }, ticks: { color: '#222', font: { weight: 'bold' } }, grid: { color: '#e1e1ee' } }
    }
  };

  cargandoTurnosPorMedico = false;
  medicoLabels: string[] = [];
  medicoCounts: number[] = [];
  pieChartTypeMedico: ChartType = 'pie';
  pieChartDataMedico: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Turnos solicitados',
      backgroundColor: [
        '#1976d2', '#388e3c', '#c62828', '#fbc02d', '#8e24aa',
        '#0288d1', '#0097a7', '#6d4c41', '#ef6c00', '#1565c0'
      ]
    }]
  };
  pieChartOptionsMedico: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: '#222', font: { weight: 'bold' } } },
      title: { display: true, text: 'Turnos solicitados por médico', color: '#222', font: { size: 19, weight: 'bold' } }
    }
  };

  cargandoTurnosFinalizadosMedico = false;
  medicoLabelsFinalizados: string[] = [];
  medicoCountsFinalizados: number[] = [];
  doughnutChartTypeFinalizados: ChartType = 'doughnut';
  doughnutChartDataFinalizados: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Turnos finalizados',
      backgroundColor: [
        '#1976d2', '#388e3c', '#c62828', '#fbc02d', '#8e24aa',
        '#0288d1', '#0097a7', '#6d4c41', '#ef6c00', '#1565c0'
      ]
    }]
  };
  doughnutChartOptionsFinalizados: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: '#222', font: { weight: 'bold' } } },
      title: { display: true, text: 'Turnos finalizados por médico', color: '#222', font: { size: 19, weight: 'bold' } }
    }
  };

  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;
  fechaDesdeFinalizados: Date | null = null;
  fechaHastaFinalizados: Date | null = null;

  @ViewChild('logTableRef') logTableRef!: ElementRef;
  @ViewChild('especialidadChartRef') especialidadChartRef!: ElementRef;
  @ViewChild('diaChartRef') diaChartRef!: ElementRef;
  @ViewChild('medicoChartRef') medicoChartRef!: ElementRef;
  @ViewChild('medicoFinalizadosChartRef') medicoFinalizadosChartRef!: ElementRef;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.cargarLogs();
    await this.cargarTurnosPorEspecialidad();
    await this.cargarTurnosPorDia();
    await this.cargarTurnosPorMedico();
    await this.cargarTurnosFinalizadosPorMedico();
  }

  async cargarLogs() {
    this.cargandoLogs = true;
    const { data, error } = await this.supabaseService.supabase
      .from('logs_ingresos')
      .select('*')
      .order('fecha', { ascending: false });

    this.cargandoLogs = false;
    if (!error && data) {
      this.logs = data;
    }
  }

  async cargarTurnosPorEspecialidad() {
    this.cargandoTurnosEspecialidad = true;
    const { data, error } = await this.supabaseService.supabase
      .from('turnos')
      .select('especialidad');

    this.cargandoTurnosEspecialidad = false;
    if (error || !data) return;

    const counts: Record<string, number> = {};
    for (const t of data) {
      if (!t.especialidad) continue;
      counts[t.especialidad] = (counts[t.especialidad] || 0) + 1;
    }
    this.especialidadLabels = Object.keys(counts);
    this.especialidadCounts = Object.values(counts);
    this.barChartData = {
      labels: this.especialidadLabels,
      datasets: [{
        data: this.especialidadCounts,
        label: 'Turnos',
        backgroundColor: '#1976d2',
        hoverBackgroundColor: '#0d47a1'
      }]
    };
  }

  async cargarTurnosPorDia() {
    this.cargandoTurnosPorDia = true;
    const { data, error } = await this.supabaseService.supabase
      .from('turnos')
      .select('fecha');

    this.cargandoTurnosPorDia = false;
    if (error || !data) return;

    const counts: Record<string, number> = {};
    for (const t of data) {
      if (!t.fecha) continue;
      const fechaStr = new Date(t.fecha).toLocaleDateString('es-AR');
      counts[fechaStr] = (counts[fechaStr] || 0) + 1;
    }
    this.diaLabels = Object.keys(counts).sort(
      (a, b) => {
        const [da, ma, ya] = a.split('/').map(Number);
        const [db, mb, yb] = b.split('/').map(Number);
        return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
      }
    );
    this.diaCounts = this.diaLabels.map(d => counts[d]);
    this.lineChartData = {
      labels: this.diaLabels,
      datasets: [{
        data: this.diaCounts,
        label: 'Turnos por día',
        borderColor: '#1976d2',
        backgroundColor: 'rgba(33,118,255,0.13)',
        pointBackgroundColor: '#1976d2',
        pointBorderColor: '#1976d2',
        tension: 0.38,
        fill: true
      }]
    };
  }

  seleccionarTab(tab: string) {
    this.tabSeleccionado = tab;
  }

  async cargarTurnosPorMedico() {
    this.cargandoTurnosPorMedico = true;

    let query = this.supabaseService.supabase
      .from('turnos')
      .select('especialista_id, fecha');

    if (this.fechaDesde) {
      query = query.gte('fecha', this.fechaDesde.toISOString().substring(0,10));
    }
    if (this.fechaHasta) {
      query = query.lte('fecha', this.fechaHasta.toISOString().substring(0,10));
    }

    const { data, error } = await query;
    if (error || !data) {
      this.cargandoTurnosPorMedico = false;
      return;
    }

    const { data: usuarios } = await this.supabaseService.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .eq('rol', 'especialista');

    const counts: Record<string, number> = {};
    for (const t of data) {
      if (!t.especialista_id) continue;
      counts[t.especialista_id] = (counts[t.especialista_id] || 0) + 1;
    }

    this.medicoLabels = Object.keys(counts).map(id => {
      const u = usuarios?.find((u: any) => u.id === id);
      return u ? `${u.nombre} ${u.apellido}` : id;
    });
    this.medicoCounts = Object.values(counts);

    this.pieChartDataMedico = {
      labels: this.medicoLabels,
      datasets: [{
        data: this.medicoCounts,
        label: 'Turnos solicitados',
        backgroundColor: [
          '#1976d2', '#388e3c', '#c62828', '#fbc02d', '#8e24aa',
          '#0288d1', '#0097a7', '#6d4c41', '#ef6c00', '#1565c0'
        ]
      }]
    };

    this.cargandoTurnosPorMedico = false;
  }

  async cargarTurnosFinalizadosPorMedico() {
    this.cargandoTurnosFinalizadosMedico = true;

    let query = this.supabaseService.supabase
      .from('turnos')
      .select('especialista_id, fecha, estado');

    if (this.fechaDesdeFinalizados) {
      query = query.gte('fecha', this.fechaDesdeFinalizados.toISOString().substring(0, 10));
    }
    if (this.fechaHastaFinalizados) {
      query = query.lte('fecha', this.fechaHastaFinalizados.toISOString().substring(0, 10));
    }

    const { data, error } = await query.eq('estado', 'realizado');
    if (error || !data) {
      this.cargandoTurnosFinalizadosMedico = false;
      return;
    }

    const { data: usuarios } = await this.supabaseService.supabase
      .from('usuarios')
      .select('id, nombre, apellido')
      .eq('rol', 'especialista');

    const counts: Record<string, number> = {};
    for (const t of data) {
      if (!t.especialista_id) continue;
      counts[t.especialista_id] = (counts[t.especialista_id] || 0) + 1;
    }

    this.medicoLabelsFinalizados = Object.keys(counts).map(id => {
      const u = usuarios?.find((u: any) => u.id === id);
      return u ? `${u.nombre} ${u.apellido}` : id;
    });
    this.medicoCountsFinalizados = Object.values(counts);

    this.doughnutChartDataFinalizados = {
      labels: this.medicoLabelsFinalizados,
      datasets: [{
        data: this.medicoCountsFinalizados,
        label: 'Turnos finalizados',
        backgroundColor: [
          '#1976d2', '#388e3c', '#c62828', '#fbc02d', '#8e24aa',
          '#0288d1', '#0097a7', '#6d4c41', '#ef6c00', '#1565c0'
        ]
      }]
    };

    this.cargandoTurnosFinalizadosMedico = false;
  }

  exportToExcel(data: any[], filename: string) {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, filename + '.xlsx');
  }

  async exportToPDF(elementRef: ElementRef, filename: string) {
    const element = elementRef.nativeElement;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename + '.pdf');
  }

  descargarLogsExcel() {
    const data = this.logs.map(l => ({
      Correo: l.email,
      'Fecha y hora': new Date(l.fecha).toLocaleString('es-AR')
    }));
    this.exportToExcel(data, 'log_ingresos');
  }
  descargarLogsPDF() { this.exportToPDF(this.logTableRef, 'log_ingresos'); }

  descargarTurnosEspecialidadPDF() { this.exportToPDF(this.especialidadChartRef, 'turnos_por_especialidad'); }
  descargarTurnosEspecialidadExcel() {
    const data = this.especialidadLabels.map((e, i) => ({
      Especialidad: e,
      Turnos: this.especialidadCounts[i] || 0
    }));
    this.exportToExcel(data, 'turnos_por_especialidad');
  }

  descargarTurnosPorDiaPDF() { this.exportToPDF(this.diaChartRef, 'turnos_por_dia'); }
  descargarTurnosPorDiaExcel() {
    const data = this.diaLabels.map((d, i) => ({
      Día: d,
      Turnos: this.diaCounts[i] || 0
    }));
    this.exportToExcel(data, 'turnos_por_dia');
  }

  descargarTurnosMedicoPDF() { this.exportToPDF(this.medicoChartRef, 'turnos_por_medico'); }
  descargarTurnosMedicoExcel() {
    const data = this.medicoLabels.map((m, i) => ({
      Médico: m,
      'Turnos solicitados': this.medicoCounts[i] || 0
    }));
    this.exportToExcel(data, 'turnos_por_medico');
  }

  descargarTurnosFinalizadosMedicoPDF() { this.exportToPDF(this.medicoFinalizadosChartRef, 'turnos_finalizados_por_medico'); }
  descargarTurnosFinalizadosMedicoExcel() {
    const data = this.medicoLabelsFinalizados.map((m, i) => ({
      Médico: m,
      'Turnos finalizados': this.medicoCountsFinalizados[i] || 0
    }));
    this.exportToExcel(data, 'turnos_finalizados_por_medico');
  }
}
