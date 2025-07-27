class Message {
  constructor(content, sender) {
    this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.content = content;
    this.sender = sender;
    this.messageType = 'text';
    this.reactions = [];
    this.createdAt = new Date();
  }
}

module.exports = Message;
