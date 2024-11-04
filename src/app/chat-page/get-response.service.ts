import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetResponseService {
  private apiurl = 'http://10.3.117.101:1998/getResponse'; // Keep this if it's needed for other chat functionalities

  constructor(private http: HttpClient) {}

  // Original method to get bot response
  getBotResponse(query: string): Observable<any> {
    return this.http.post<any>(this.apiurl, { query });
  }

  // New method to query previous JSON files
  queryJsonFile(filename: string, query: string): Observable<any> {
    return this.http.post<any>(`http://10.3.117.107:1999/query_json_file`, { filename, query });
  }

  // New method to store vectors after uploading PDF
  storeVectors(jsonPath: string): Observable<any> {
    return this.http.post<any>('http://127.0.0.1:1999/storing_vectors', { json_path: jsonPath });
  }
}
