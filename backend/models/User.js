class User {
  constructor(username, email, password) {
    this.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.username = username;
    this.email = email;
    this.password = password;
    this.isOnline = false;
    this.createdAt = new Date();
  }
}

module.exports = User;
