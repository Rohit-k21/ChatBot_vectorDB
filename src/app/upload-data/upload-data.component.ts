import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { PdfUploadService } from '../pdf-upload.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-upload-data',
  templateUrl: './upload-data.component.html',
  styleUrls: ['./upload-data.component.css']
})
export class UploadDataComponent implements OnInit {
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();

  pdfFile: File | null = null;
  fileName: string = '';
  fileSelected: boolean = false;
  isLoading: boolean = false;
  isUploaded: boolean = false;
  selectedPreviousPdf: string | null = null;
  selectedOption: 'new' | 'previous' | null = null;
  previousPdfs: string[] = [];
  query: string = '';
  queryResults: any[] = [];
  showModal: boolean = false;
  isSuccess:boolean = false;

  constructor(private pdfUploadService: PdfUploadService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadJsonFiles();
  }

  // Load previous JSON files
  loadJsonFiles() {
    this.pdfUploadService.listJsonFiles().subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.previousPdfs = response.json_files;
        } else {
          console.error('Error fetching JSON files:', response.message);
        }
      },
      error: (error) => {
        console.error('Error fetching JSON files:', error);
      }
    });
  }

  // Open the upload modal
  openUploadModal() {
    this.selectedOption = 'new';
    this.clearFile();
    this.showModal = true;
  }

  // Close the upload modal
  closeUploadModal() {
    this.showModal = false;
    this.clearFile();
    this.closeModal.emit();
  }

  selectOption(option: 'new' | 'previous') {
    this.selectedOption = option;
    this.clearFile();
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pdfFile = input.files[0];
      console.log(this.pdfFile);
      this.fileName = this.pdfFile.name;
      this.fileSelected = true;
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.pdfFile = event.dataTransfer.files[0];
      this.fileName = this.pdfFile.name;
      this.fileSelected = true;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  submitFile() {
    if (this.pdfFile) {
      this.isLoading = true;
      console.log("Entered in submit file");

      setTimeout(() => {
        this.isLoading = false;
        this.isSuccess = true;

        // Optionally, reset the modal after some time
        setTimeout(() => {
          this.isSuccess = false;
          this.fileSelected = false;
          this.fileName = null;
        }, 3000); // Reset after 3 seconds
      }, 2000); // Simulate upload duration

      this.pdfUploadService.uploadPdf(this.pdfFile).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isUploaded = true;
          console.log(response.message); // Handle success message from backend
          this.toastr.success('File upload completed!', 'Success!');

          if (response.status === 200) {
            const jsonPath = response.json_path;

            setTimeout(() => {
              window.location.reload();
              console.log("RESPONSE PDF UPLOAD", response);
            }, 1000);
          }

          this.closeUploadModal();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error uploading PDF:', error);
        }
      });
    }
  }

  // New method to call the /storing_vectors API
  storeVectors(jsonPath: string) {
    console.log("Storing vectors...", jsonPath);

    this.pdfUploadService.storeVectors(jsonPath).subscribe({
      next: (response) => {
        console.log(response)

        console.log('Vectors stored:', response.message);

      },
      error: (error) => {
        console.error('Error storing vectors:', error);
      }
    });
  }

  submitPreviousPdf() {
    if (this.selectedPreviousPdf && this.query) {
      this.isLoading = true;

      this.pdfUploadService.queryJsonFile(this.selectedPreviousPdf, this.query).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.status === 200) {
            this.queryResults = response.results;
          } else {
            console.error('Error fetching query results:', response.message);
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error querying JSON file:', error);
        }
      });
    }
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log("Entered in key event");
      event.preventDefault();
      this.submitFile();
    }
  }

  clearFile() {
    this.pdfFile = null;
    this.fileName = '';
    this.fileSelected = false;
    this.isUploaded = false;
    this.isLoading = false;
    this.selectedPreviousPdf = null;
    this.query = '';
    this.queryResults = [];
  }
}
