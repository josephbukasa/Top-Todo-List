import { saveToStorage, loadFromStorage } from './utils.js';

const STORAGE_KEY = 'todos';

export const todoManager = {
  data: loadFromStorage(STORAGE_KEY) || [],

  add(text, deadline = null) {
    this.data.push({
      text: text.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      deadline: deadline || null
    });
    this.save();
  },

  toggleComplete(index) {
    this.data[index].completed = !this.data[index].completed;
    this.save();
  },

  delete(index) {
    this.data.splice(index, 1);
    this.save();
  },

  clearCompleted() {
    this.data = this.data.filter(todo => !todo.completed);
    this.save();
  },

  update(index, newText) {
    if (newText.trim() === '') {
      this.delete(index);
      return;
    }
    this.data[index].text = newText.trim();
    this.save();
  },

  get filtered() {
    return (filter) => {
      if (filter === 'active') return this.data.filter(t => !t.completed);
      if (filter === 'completed') return this.data.filter(t => t.completed);
      return this.data;
    };
  },

  get remainingCount() {
    return this.data.filter(t => !t.completed).length;
  },

  save() {
    saveToStorage(STORAGE_KEY, this.data);
  }
};