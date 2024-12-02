import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private resurl = 'http://127.0.0.1:5001';

  constructor(private http: HttpClient) {}

  promptQuery(query: string): Observable<any> {
    return this.http.post(`${this.resurl}/prompt_query`, { query });
  }

  getCollection(): Observable<any> {
    return this.http.get(`${this.resurl}/get_collection`);
  }

  setCollection(collection_name: string): Observable<any> {
    return this.http.post(`${this.resurl}/set_collection`, { collection_name });
  }

  // Old implementation commented correctly
  /*
  getHistory(): Observable<any> {
    return this.http.get(`${this.resurl}/get_query_history`);
  }
  */

  getHistory(collectionName?: string): Observable<any> {
    let url = `${this.resurl}/get_query_history`;
    if (collectionName) {
      url += `?collection=${collectionName}`;
    }
    return this.http.get(url);
  }

  getLastContext(collectionName): Observable<any> {
    return this.http.get(`${this.resurl}/get_last_context`);
  }
}
