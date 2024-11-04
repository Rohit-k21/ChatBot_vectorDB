import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private resurl = 'http://10.3.117.101:1998'

  constructor(private http: HttpClient) { }ng


  promptQuery(query: string): Observable<any> {
    return this.http.post(`${this.resurl}/prompt_query`, { query });
  }

  getCollection(): Observable<any> {
    return this.http.get(`${this.resurl}/get_collection`);
  }

  setCollection(collection_name): Observable<any> {
    return this.http.post(`${this.resurl}/set_collection`, { collection_name});
  }

}
