import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AsanaTaskPayload {
  title: string;
  description: string;
  stepsToReproduce?: string;
  priority?: 'Low' | 'Medium' | 'High';
  pageUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AsanaService {

  private readonly apiBase = 'https://app.asana.com/api/1.0';

  constructor(private http: HttpClient) {}

  createBugTask(payload: AsanaTaskPayload): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${environment.asana.personalAccessToken}`,
      'Content-Type': 'application/json'
    });

    const priorityLabel = payload.priority ? `[${payload.priority}] ` : '';
    const notes = this.buildNotes(payload);

    const body = {
      data: {
        name: `${priorityLabel}Bug: ${payload.title}`,
        notes,
        projects: [environment.asana.projectGid],
        tags: []
      }
    };

    return this.http.post(`${this.apiBase}/tasks`, body, { headers });
  }

  private buildNotes(payload: AsanaTaskPayload): string {
    const lines: string[] = [];

    lines.push(`📋 DESCRIPTION\n${payload.description}`);

    if (payload.stepsToReproduce?.trim()) {
      lines.push(`\n🔁 STEPS TO REPRODUCE\n${payload.stepsToReproduce}`);
    }

    if (payload.pageUrl) {
      lines.push(`\n🔗 PAGE URL\n${payload.pageUrl}`);
    }

    lines.push(`\n🕐 REPORTED AT\n${new Date().toLocaleString()}`);

    return lines.join('\n');
  }
}
