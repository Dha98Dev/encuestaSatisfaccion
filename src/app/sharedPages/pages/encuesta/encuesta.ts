import { ChangeDetectorRef, Component } from '@angular/core';
import confetti from 'canvas-confetti';
import { preguntas } from '../../../administracion/pages/administrar-preguntas/administrar-preguntas';
import { PreguntasService } from '../../../administracion/services/preguntas.service';

import { ActivatedRoute, Router } from '@angular/router';
import { respuesta } from '../../../interfaces/departamento.interfaces';
import { PreguntasPorDepartamentoData } from '../../interfaces/preguntasDepartamentoNoAuth.interface';
import { TramiteService } from '../../services/tramites.service';
import { Tramite } from '../../interfaces/tramites.interface';
import { AuthService } from '../../../auth/services/Auth.service';
@Component({
  selector: 'app-encuesta',
  standalone: false,
  templateUrl: './encuesta.html',
  styleUrl: './encuesta.scss',
})
export class Encuesta {
  constructor(
    private cd: ChangeDetectorRef,
    private preguntasService: PreguntasService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tramitesService: TramiteService,
    private authService:AuthService
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
  private idDepartamento: string = '';
  public listadoTramites: Tramite[] = [];
  public mostrarTiposTramites: boolean = true;
  public TramiteSeleccionado:Tramite={} as Tramite
  ngOnInit() {
    // leemos el parametro enviado por la url

    const idDepartamento = this.activateRoute.snapshot.paramMap.get('idDepartamento');
    this.idDepartamento = idDepartamento!;
    console.log(idDepartamento);

    this.getListadoPreguntas();
    this.getRepuestas();
  }

  getListadoPreguntas() {
    this.preguntasService.getPreguntasDepartamentoNoAuth(this.idDepartamento).subscribe({
      next: (resp) => {
        this.listadoPreguntas = resp.data.slice(0, 2);
        console.log(resp.data);
        if (this.listadoPreguntas.length <=0 &&  !this.authService.isLoggedIn()) {
          this.router.navigate(['/auth/login'])
        }else if (this.listadoPreguntas.length <=0 &&  this.authService.isLoggedIn()) {
          this.router.navigate(['/a/estadistica'])
        }
        this.cd.markForCheck();
        this.getTiposTramitesByDepartamento();
      },
      error: (err) => {
        this.router.navigate(['/not-found']);
      },
    });
  }
  getRepuestas() {
    this.preguntasService.getCatalogoRespuestas().subscribe({
      next: (resp) => {
        this.respuestas = resp.data;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  getTiposTramitesByDepartamento() {
    this.tramitesService.getTiposTramitesByDepartamento(this.idDepartamento).subscribe({
      next: (resp) => {
        this.listadoTramites = resp.data;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  seleccionarRespuesta(pregunta: PreguntasPorDepartamentoData, respuesta: any): void {
    const index = this.respuestasEncuesta.findIndex(
      (item) => item.pregunta_departamento_id === pregunta.pregunta_departamento_id,
    );

    const data = {
      pregunta_departamento_id: pregunta.pregunta_departamento_id,
      respuesta_id: respuesta.id,
      tramite_id:this.TramiteSeleccionado.id
    };

    if (index >= 0) {
      this.respuestasEncuesta[index] = data;
    } else {
      this.respuestasEncuesta.push(data);
    }

    console.log(this.respuestasEncuesta);
  }
  isRespuestaSeleccionada(pregunta: PreguntasPorDepartamentoData, respuesta: any): boolean {
    return this.respuestasEncuesta.some(
      (item) =>
        item.pregunta_departamento_id === pregunta.pregunta_departamento_id &&
        item.respuesta_id === respuesta.id,
    );
  }
  enviarEncuesta(): void {
    if (this.respuestasEncuesta.length == 2) {
      console.log('enviando las respuestas al backend');
      console.log(this.respuestasEncuesta);
      this.preguntasService.responderEncuesta(this.respuestasEncuesta).subscribe({
        next: (resp) => {
          console.log(resp);
          this.mostrarDialogoGracias = true;
          this.respuestasEncuesta = [];
          this.TramiteSeleccionado={} as Tramite
          this.cd.markForCheck();
          this.lanzarConfetiFullScreen();
          setTimeout(() => {
            this.mostrarDialogoGracias = false;
            this.mostrarTiposTramites=true
            this.cd.markForCheck();
          }, 6000);
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }

  cerrarDialogo() {
    this.mostrarDialogoGracias = false;
  }

  lanzarConfetiFullScreen() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 10,
        angle: 60,
        spread: 80,
        origin: { x: 0 },
      });

      confetti({
        particleCount: 10,
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
}
