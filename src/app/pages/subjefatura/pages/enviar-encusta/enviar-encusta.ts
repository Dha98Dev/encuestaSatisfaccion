import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { respuesta } from '../../../../core/interfaces/departamento.interfaces';
import { PreguntasService } from '../../../administracion/services/preguntas.service';
import { AuthService } from '../../../auth/services/Auth.service';
import { PreguntasPorDepartamentoData } from '../../../sharedPages/interfaces/preguntasDepartamentoNoAuth.interface';
import { Tramite } from '../../../sharedPages/interfaces/tramites.interface';
import { TramiteService } from '../../../sharedPages/services/tramites.service';
import { PantallasService } from '../../services/pantallas.service';
import { Pantalla } from '../../interfaces/pantallas.interface';
import { WebsocketService } from '../../../../core/services/websocket.service';

@Component({
  selector: 'app-enviar-encusta',
  standalone: false,
  templateUrl: './enviar-encusta.html',
  styleUrl: './enviar-encusta.scss',
})
export class EnviarEncusta implements OnDestroy {
  constructor(
    private cd: ChangeDetectorRef,
    private preguntasService: PreguntasService,
    private activateRoute: ActivatedRoute,
    private router: Router,
    private tramitesService: TramiteService,
    private authService: AuthService,
    private pantallasService: PantallasService,
    private websocketService: WebsocketService,
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
  public mostrarTiposTramites: boolean = false;
  public TramiteSeleccionado: Tramite = {} as Tramite;
  public equipos: Pantalla[] = [];
  equipoSeleccionado: any = {} as any;

  ngOnInit() {
    this.idDepartamento = this.authService.getDepartamentos()[0].id;

    this.getTiposTramitesByDepartamento();
    this.getPantallas();

    this.websocketService.conectar();

    this.websocketService.escucharEstadoPantallas((evento) => {
      console.log('Estado pantalla actualizado:', evento);

      this.actualizarEstadoPantalla(evento);
    });
  }

  getTiposTramitesByDepartamento() {
    this.tramitesService.getTiposTramitesByDepartamento(this.idDepartamento).subscribe({
      next: (resp) => {
        this.listadoTramites = resp.data;
        this.cd.markForCheck();
      },
      error: (err) => {},
    });
  }
  getPantallas() {
    this.pantallasService.getPantallas().subscribe({
      next: (resp) => {
        console.log(resp);
        this.equipos = resp.data;
        this.cd.markForCheck();
      },
      error: (err) => {
        console.log(err);
      },
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

    if (this.equipoSeleccionado?.codigo === evento.codigo && evento.disponible === false) {
      this.equipoSeleccionado = {};
    }

    this.cd.markForCheck();
  }
  cerrarDialogo() {
    this.mostrarDialogoGracias = false;
  }
  enviarEncuesta(){
    let data={departamento_id: this.idDepartamento, tramite_id:this.TramiteSeleccionado.id, codigo_pantalla:this.equipoSeleccionado.codigo}
    console.log(data);
    
    this.pantallasService.enviarEncuestaAPantalla(data).subscribe({
      next:resp =>{
        this.TramiteSeleccionado={} as Tramite
        this.equipoSeleccionado={}
        this.cd.markForCheck()
      },
      error: err =>{
        console.log(err);
        
      }
    })
  }
  ngOnDestroy() {
    this.websocketService.desconectar();
  }

}
