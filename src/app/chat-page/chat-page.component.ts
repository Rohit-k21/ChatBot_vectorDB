import { Component, ViewChild, ElementRef,OnInit } from '@angular/core';
import { GetResponseService } from './get-response.service';
import { ChatService } from './chat.service';
import { ToastrService } from 'ngx-toastr';
import { formatDate } from '@angular/common';


@Component({
  selector: 'chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatComponent {
  userInput: string = '';
  lastContext : string = '';
  isLoading:boolean = false;
  isDropdownOpen: boolean = false;
  selectedPreviousPdf: string = '';
  chatMessages: string[] = [];
  messages: string[] = [];
  displayedText: string[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;
  hoverIndex: number | null = null;
  isModalOpen: boolean = false;
  searchTerm: string = '';
  filteredCollections: any[] = [];
  currentLoadingIndex: number | null = null;
  showWelcomeMessage: boolean = true;
  queryResponseHistory: any[] = [];
  isHistoryModalOpen: boolean = false;
  filteredQueryResponseHistory: any[] = [];
  isDeleteModalOpen: boolean = false;
  isConfirmModalOpen: boolean = false;
  deletionOption: string = 'clearAll';
  selectedDeleteDate: string = '';


  constructor(private responseService: GetResponseService, private chatService: ChatService, private toastr: ToastrService) {}
  copyMessageVisible: boolean = false;
  lastCopiedMessage: string = '';
  selectedDate: string = '';
  dropOption;
  @ViewChild('botMessageContainer', { static: true }) botMessageContainer!: ElementRef;

  ngOnInit() {
    this.chatService.getCollection().subscribe(response => {
      console.log(response);
      this.dropOption = response
      this.filteredCollections = [...this.dropOption];
    }, error => {
      console.error('Error:', error);
    });
    this.fetchHistory();
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen) {
      this.searchTerm = '';  // Reset the search term when opening
      this.filteredCollections = [...this.dropOption];  // Show all collections initially
    }
  }

  filterCollections(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredCollections = this.dropOption.filter((pdf) =>
      pdf.name.toLowerCase().includes(term)
    );
  }

  selectCollection(pdf: any): void {
    this.selectedPreviousPdf = pdf.name; // Store the selected collection
    console.log('Selected collection:', this.selectedPreviousPdf);

    // Fetch history for the newly selected collection
    this.fetchHistory();
    this.searchTerm = this.selectedPreviousPdf;
    this.closeDropdown();
  }

  sendMessage() {
    if (!this.userInput) return;
    this.showWelcomeMessage = false; // Hide welcome message on input
    console.log("INSIDE Send message");

    const userMessage = this.userInput; // Store user message temporarily
    this.userInput = ''; // Clear input immediately after storing

    // Add the user message to the chat
    this.chatMessages.push(`${userMessage}`);

    this.messages.push(userMessage);
    this.displayedText.push('');
    this.currentLoadingIndex = this.chatMessages.length-1;

    this.isLoading = true;
    console.log(this.currentLoadingIndex, this.isLoading);

    // Call the API to get the bot response
    this.chatService.promptQuery(userMessage).subscribe(response => {
      this.isLoading = false;
      // Handle the response from the API
      console.log(response);

      // Check if the response has the expected structure
      const botResponse = response?.model_response; // Use optional chaining
      if (botResponse) {
        this.chatMessages.push(`Bot: ${botResponse}`); // Add bot's response
        this.displayedText.push(''); // Prepare for displaying bot response
        this.typeGeneratedSummary(botResponse, this.chatMessages.length - 1); // Display the bot's response with typing effect
      }

    }, error => {
      console.error('Error:', error);
    });
  }

  generateResponse(input: string) {
    this.responseService.getBotResponse(input).subscribe(
      (response: any) => {
        if (response.results && response.results.length > 0) {
          const botResponse = response.results[0].content;
          this.chatMessages.push(`Bot: ${botResponse}`);
          this.displayedText.push('');
          this.typeGeneratedSummary(botResponse, this.chatMessages.length - 1);
        } else {
          this.chatMessages.push('Bot: No results found.');
        }
      },
      (error) => {
        console.error('Error fetching response:', error);
        this.chatMessages.push('Bot: An error occurred while fetching the response.');
      }
    );
  }

  formatBotMessage(message: string): string {
    if (!message) return '';
    return message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/(<strong>.*?<\/strong>)/g, '<br>$1');
}

  private typeGeneratedSummary(msg: string, index: number): void {
    let currentText = '';
    const delay = 20;

    for (let i = 0; i < msg.length; i++) {
      setTimeout(() => {
        currentText += msg.charAt(i);
        this.displayedText[index] = currentText;
      }, i * delay);
    }
  }

  copyToClipboard(message: string) {
    const textarea = document.createElement('textarea');
    textarea.value = message;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    this.lastCopiedMessage = message;
    this.copyMessageVisible = true;

    setTimeout(() => {
      this.copyMessageVisible = false;
    }, 2000);
  }

  isBotMessage(msg: string): boolean {
    return msg?.startsWith('Bot:');
  }

  editMessage(index: number) {
    this.isEditing = true;
    this.editIndex = index;
    this.userInput = this.messages[index];
  }

  updateMessage(index: number) {
    if (this.userInput.trim()) {
      this.messages[index] = this.userInput;
      this.chatMessages[index] = `You: ${this.userInput}`;

      const botResponseIndex = this.chatMessages.findIndex((msg, i) => i > index && this.isBotMessage(msg));
      if (botResponseIndex !== -1) {
        this.chatMessages.splice(botResponseIndex, 1);
      }

      this.generateResponse(this.userInput);
      this.isEditing = false;
      this.editIndex = null;
      this.userInput = '';
    }
  }

  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // Function to handle selection from the dropdown and save action
  submitPreviousPdf(): void {
    if (this.selectedPreviousPdf) {
      console.log('Selected collection:', this.selectedPreviousPdf);
      // Add logic to load the selected collection's data
      this.chatService.setCollection(this.selectedPreviousPdf).subscribe(response => {
        // Handle the response from the API
        console.log(response);
        this.searchTerm = "";
        this.closeDropdown()
        this.isDropdownOpen = false
      }, error => {
        console.error('Error:', error);
      });
      ; // Close the dropdown after selection
    } else {
      alert('Please select a collection before saving.');
    }
  }

  toggleModal() {
    this.isModalOpen = !this.isModalOpen;
  }

  toggleHistoryModal(): void {
    if (!this.isHistoryModalOpen) {
      // Fetch history for the selected collection
      this.fetchHistory();
    }
    this.isHistoryModalOpen = !this.isHistoryModalOpen;
  }


  fetchHistory(): void {
    this.chatService.getHistory(this.selectedPreviousPdf).subscribe(
      (response) => {
        console.log('History fetched for collection:', this.selectedPreviousPdf, response);

        // Assign response directly to filteredQueryResponseHistory
        this.queryResponseHistory = response.history || [];
        this.filteredQueryResponseHistory = [...this.queryResponseHistory];
      },
      (error) => {
        console.error('Error fetching history:', error);
        this.toastr.error('Failed to load history', 'Error');
      }
    );
  }

  toggleResponse(item: any): void {
    // Check if the full response is already being shown
    item.showFullResponse = !item.showFullResponse;
  }

  loadHistoryItem(historyItem: any): void {
    historyItem.showFullResponse = !historyItem.showFullResponse; // Toggle response visibility

    const { query, response } = historyItem;

    // Append the query and response to the chat messages


    // Optionally scroll to the bottom of the chat
    this.botMessageContainer.nativeElement.scrollTop = this.botMessageContainer.nativeElement.scrollHeight;
  }

  clearHistory() {
    this.queryResponseHistory = [];
  }

  filterHistory(): void {
    if (!this.selectedDate) {
      // If no date selected, show all history
      this.filteredQueryResponseHistory = [...this.queryResponseHistory];
    } else {
      // Filter by selected date
      this.filteredQueryResponseHistory = this.queryResponseHistory.filter((item) => {
        const itemDate = formatDate(new Date(item.timestamp), 'yyyy-MM-dd', 'en-US');
        return itemDate === this.selectedDate;
      });
    }
  }

  resetFilters(): void {
    this.selectedDate = '';
    this.filteredQueryResponseHistory = [...this.queryResponseHistory];
  }

  // Open the delete modal
  openDeleteModal() {
    this.isDeleteModalOpen = true;
  }

  // Close the delete modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  // Open the confirm deletion modal
  openConfirmModal() {
    this.isConfirmModalOpen = true;
  }

  // Close the confirm deletion modal
  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  // Confirm deletion action
  confirmDeletion() {
    // If clearing by date, check if a date is selected
    if (this.deletionOption === 'clearByDate' && !this.selectedDeleteDate) {
      this.toastr.error('Please select a date to delete history by date.', 'Error');
      return;
    }

    this.closeDeleteModal();
    this.openConfirmModal();
  }

  // Execute the deletion based on the selected option
  deleteHistory() {
    if (this.deletionOption === 'clearAll') {
      // Clear all history
      this.queryResponseHistory = [];
      this.filteredQueryResponseHistory = [];
      this.toastr.success('All history has been cleared.', 'Success');
    } else if (this.deletionOption === 'clearByDate' && this.selectedDeleteDate) {
      // Clear history by selected date
      this.queryResponseHistory = this.queryResponseHistory.filter((item) => {
        const itemDate = new Date(item.timestamp).toLocaleDateString();
        return itemDate !== this.selectedDeleteDate;
      });
      this.filteredQueryResponseHistory = this.queryResponseHistory;
      this.toastr.success('History for the selected date has been cleared.', 'Success');
    }

    // Close the confirmation modal
    this.closeConfirmModal();
  }

  loadLastContext(collectionName: string): void {
    this.chatService.getLastContext(collectionName).subscribe(
      (response) => {
        this.lastContext = response.context || 'No context available.';
        this.chatMessages.push(`Bot: Here is the summary of our last conversation: ${this.lastContext}`);
      },
      (error) => {
        console.error('Error fetching last context:', error);
      }
    );
  }
}
