import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import confetti from 'canvas-confetti';
import { preguntas } from '../../../administracion/pages/administrar-preguntas/administrar-preguntas';
import { PreguntasService } from '../../../administracion/services/preguntas.service';

import { ActivatedRoute, Router } from '@angular/router';

import { PreguntasPorDepartamentoData } from '../../interfaces/preguntasDepartamentoNoAuth.interface';
import { TramiteService } from '../../services/tramites.service';
import { Tramite } from '../../interfaces/tramites.interface';
import { AuthService } from '../../../auth/services/Auth.service';
import { respuesta } from '../../../../core/interfaces/departamento.interfaces';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { PantallasService } from '../../../subjefatura/services/pantallas.service';
import { Pantalla } from '../../../subjefatura/interfaces/pantallas.interface';
@Component({
  selector: 'app-encuesta',
  standalone: false,
  templateUrl: './encuesta.html',
  styleUrl: './encuesta.scss',
})
export class Encuesta implements OnDestroy {
  constructor(
    private cd: ChangeDetectorRef,
    private preguntasService: PreguntasService,
    private activateRoute: ActivatedRoute,
    private websocketService: WebsocketService,
    private pantallaService: PantallasService,
  ) {}
  mostrarDialogoGracias = false;
  public listadoPreguntas: PreguntasPorDepartamentoData[] = [];
  respuestas: respuesta[] = [];
  respuestasEncuesta: {
    pregunta_departamento_id: string;
    respuesta_id: string;
  }[] = [];
  colores: string[] = [
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-purple-500 to-indigo-500',
    'bg-gradient-to-r from-blue-500 to-cyan-500',
    'bg-gradient-to-r from-green-500 to-emerald-500',
    'bg-gradient-to-r from-yellow-400 to-orange-500',
    'bg-gradient-to-r from-fuchsia-500 to-pink-500',
  ];
  private pantalla: string = '';
  public listadoTramites: Tramite[] = [];
  public TramiteSeleccionado: string = '';
  public nombreTramiteSeleccionado: string = '';
  public nombrePantalla: string = '';
  preguntaActualIndex = 0;
  animacionPregunta = 'animate__zoomIn';
  public equipos: Pantalla[] = [];
  private identificadorEncuesta: string = '';

  ngOnInit() {
    const codigoPantalla = this.activateRoute.snapshot.paramMap.get('pantalla');

    if (!codigoPantalla) {
      console.error('No se encontró el código de pantalla en la URL');
      return;
    }

    this.pantalla = codigoPantalla;
    this.getRepuestas();
    this.getPantalla();

    this.websocketService.conectar();

    this.websocketService.suscribirPantalla(this.pantalla, (evento) => {
      console.log('Encuesta recibida:', evento);
      this.cargarEncuestaDesdeEvento(evento);
    });

    this.websocketService.escucharEstadoPantallas((evento) => {
      console.log('Estado pantalla actualizado:', evento);

      setTimeout(() => {
        this.actualizarEstadoPantalla(evento);
      }, 3000);
    });
  }

  actualizarEstadoPantalla(evento: any) {
    this.equipos = this.equipos.map((pantalla) => {
      if (pantalla.codigo === evento.codigo) {
        return {
          ...pantalla,
          disponible: evento.disponible,
        };
      }

      return pantalla;
    });

    if (this.pantalla === evento.codigo && evento.disponible === true) {
      this.limpiarEncuestaActual();
    }

    this.cd.markForCheck();
  }

  limpiarEncuestaActual() {
    this.mostrarDialogoGracias = false;
    this.listadoPreguntas = [];
    this.respuestasEncuesta = [];
    this.TramiteSeleccionado = '';
    this.nombreTramiteSeleccionado = '';
    this.preguntaActualIndex = 0;
    this.animacionPregunta = 'animate__zoomIn';

    this.cd.detectChanges();
  }

  getPantalla() {
    this.pantallaService.getInfoPantalla(this.pantalla).subscribe({
      next: (resp) => {
        this.nombrePantalla = resp.nombre;
      },
      error: (err) => {},
    });
  }
  cargarEncuestaDesdeEvento(evento: any) {
    this.listadoPreguntas = evento.encuesta;
    this.TramiteSeleccionado = evento.tramite_id;
    this.identificadorEncuesta = evento.reserva_uuid;
    this.nombreTramiteSeleccionado = evento.nombre_tramite;
    this.preguntaActualIndex = 0;
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

  getRepuestas() {
    this.preguntasService.getCatalogoRespuestas().subscribe({
      next: (resp) => {
        this.respuestas = resp.data;
        this.cd.markForCheck();
      },
      error: (err) => {},
    });
  }

  seleccionarRespuesta(pregunta: PreguntasPorDepartamentoData, respuesta: any): void {
    const index = this.respuestasEncuesta.findIndex(
      (item) => item.pregunta_departamento_id === pregunta.pregunta_departamento_id,
    );

    const data = {
      pregunta_departamento_id: pregunta.pregunta_departamento_id,
      respuesta_id: respuesta.id,
      tramite_id: this.TramiteSeleccionado,
    };

    if (index >= 0) {
      this.respuestasEncuesta[index] = data;
    } else {
      this.respuestasEncuesta.push(data);
    }
  }
  isRespuestaSeleccionada(pregunta: PreguntasPorDepartamentoData, respuesta: any): boolean {
    return this.respuestasEncuesta.some(
      (item) =>
        item.pregunta_departamento_id === pregunta.pregunta_departamento_id &&
        item.respuesta_id === respuesta.id,
    );
  }
  enviarEncuesta(): void {
    if (this.respuestasEncuesta.length == this.listadoPreguntas.length) {
      let payload = {
        reserva_uuid: this.identificadorEncuesta,
        respuestas: this.respuestasEncuesta,
      };

      this.preguntasService.responderEncuesta(payload).subscribe({
        next: (resp) => {
          this.mostrarDialogoGracias = true;
          this.identificadorEncuesta=''
          this.respuestasEncuesta = [];
          this.TramiteSeleccionado = '';
          this.listadoPreguntas = [];
          this.nombreTramiteSeleccionado = '';
          this.cd.markForCheck();
          this.lanzarConfetiFullScreen();
          this.liberarPantalla();
          setTimeout(() => {
            this.mostrarDialogoGracias = false;
            this.cd.markForCheck();
          }, 3000);
        },
        error: (err) => {},
      });
    }
  }
  liberarPantalla() {
    this.websocketService.liberarPantalla(this.pantalla).subscribe({
      next: (resp) => {},
    });
  }

  cerrarDialogo() {
    this.mostrarDialogoGracias = false;
  }

  lanzarConfetiFullScreen() {
    const duration = 1 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
      });

      confetti({
        particleCount: 5,
        angle: 120,
        spread: 80,
        origin: { x: 1 },
      });

      confetti({
        particleCount: 10,
        spread: 100,
        origin: {
          x: Math.random(), // 🔥 esto cubre todo el ancho
          y: Math.random() - 0.2,
        },
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }

  getEmoji(orden: number) {
    switch (orden) {
      case 1:
        return '😞';
      case 2:
        return '😐';
      case 3:
        return '🙂';
      case 4:
        return '😍';
      default:
        return;
        break;
    }
  }
  getImage(orden: number) {
    switch (orden) {
      case 1:
        return '/assets/images/muy-malo.png';
      case 2:
        return '/assets/images/regular.png';
      case 3:
        return '/assets/images/bueno.png';
      case 4:
        return '/assets/images/excelente.png';
      default:
        return;
        break;
    }
  }

  get preguntaActual() {
    return this.listadoPreguntas[this.preguntaActualIndex];
  }

  seleccionarYContinuar(preg: any, resp: any) {
    this.seleccionarRespuesta(preg, resp);

    setTimeout(() => {
      if (this.preguntaActualIndex < this.listadoPreguntas.length - 1) {
        this.preguntaActualIndex++;
        this.animacionPregunta = '';

        setTimeout(() => {
          this.animacionPregunta = 'animate__zoomIn';
          this.cd.detectChanges();
        }, 10);
      } else {
        this.enviarEncuesta();
      }

      this.cd.detectChanges();
    }, 250);
  }

  ngOnDestroy() {
    if (this.pantalla) {
      this.websocketService.salirPantalla();
    }

    this.websocketService.desconectar();
  }
}
