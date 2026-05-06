import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Env } from '../../core/env/env';
import { TramitesResponse } from '../interfaces/tramites.interface';

@Injectable({providedIn: 'root'})
export class TramiteService {
    constructor(private http:HttpClient) { }
    private url:string=Env.url

    getTiposTramitesByDepartamento(idDepartamento:string){
        return this.http.get<TramitesResponse>(this.url+`tramites/departamento/${idDepartamento}`)
    }
}