import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class CrudService {
    private baseUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /***
     * Get
     */
    fetchData(endpoint: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.baseUrl}${endpoint}`);
    }

    addData(endpoint: string, newData: any): Observable<any> {
        return this.http.post<any>(`${this.baseUrl}${endpoint}`, newData);
    }

    updateData(endpoint: string, updatedData: any): Observable<any> {
        return this.http.put<any>(`${this.baseUrl}${endpoint}`, updatedData);
    }

    deleteData(endpoint: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}${endpoint}`);
    }
}

