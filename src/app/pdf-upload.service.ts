import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PdfUploadService {
  private apiUrl = 'http://127.0.0.1:5001/pdf_upload';

  constructor(private http: HttpClient) { }

  uploadPdf(pdfFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', pdfFile);  // Attach the PDF file

    return this.http.post<any>(this.apiUrl, formData);
  }


  // Method to list previous JSON files
  listJsonFiles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/list_json_files`);
  }

  // Method to query a specific JSON file
  queryJsonFile(filename: string, query: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/query_json_file`, { filename, query });
  }

  // New method to store vectors after PDF upload
  storeVectors(jsonPath: string): Observable<any> {
    return this.http.post<any>('http://10.3.117.101:1998/storing_vectors', { json_path: jsonPath });
  }
}
