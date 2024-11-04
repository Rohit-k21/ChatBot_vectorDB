import { Component, ViewChild, ElementRef } from '@angular/core';
import { GetResponseService } from './get-response.service';
import { ChatService } from './chat.service';

@Component({
  selector: 'chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.css'],
})
export class ChatComponent {
  userInput: string = '';
  isDropdownOpen: boolean = false;
  previousPdfs: string[] = ['Collection 1', 'Collection 2', 'Collection 3'];
  selectedPreviousPdf: string = '';
  chatMessages: string[] = [];
  messages: string[] = [];
  displayedText: string[] = [];
  isEditing: boolean = false;
  editIndex: number | null = null;
  hoverIndex: number | null = null;
  isModalOpen: boolean = false;

  constructor(private responseService: GetResponseService, private chatService: ChatService) {}

  copyMessageVisible: boolean = false;
  lastCopiedMessage: string = '';
  dropOption;
  @ViewChild('botMessageContainer', { static: true }) botMessageContainer!: ElementRef;

  ngOnInit() {
    this.chatService.getCollection().subscribe(response => {
      // Handle the response from the API
      console.log(response);
      this.dropOption = response
    }, error => {
      console.error('Error:', error);
    });
  }

  donotMessage() {
    if (this.userInput.trim()) {
      this.chatMessages.push(`${this.userInput}`);
      this.messages.push(this.userInput);
      this.displayedText.push('');
      this.generateResponse(this.userInput);
      this.userInput = '';
    }
  }

  sendMessage() {
    if (!this.userInput) return;

    console.log("INSIDE Send message");

    const userMessage = this.userInput; // Store user message temporarily
    this.userInput = ''; // Clear input immediately after storing

    // Add the user message to the chat
    this.chatMessages.push(`${userMessage}`);
    this.messages.push(userMessage);
    this.displayedText.push('');

    // Call the API to get the bot response
    this.chatService.promptQuery(userMessage).subscribe(response => {
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

  clearHistory() {
    this.chatMessages = [];
    this.messages = [];
    this.displayedText = [];
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

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Function to handle selection from the dropdown and save action
  submitPreviousPdf(): void {
    if (this.selectedPreviousPdf) {
      console.log('Selected collection:', this.selectedPreviousPdf);
      // Add logic to load the selected collection's data
      this.chatService.setCollection(this.selectedPreviousPdf).subscribe(response => {
        // Handle the response from the API
        console.log(response);
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
}
