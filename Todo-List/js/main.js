import { todoManager } from './todoManager.js';
import { notesManager } from './notesManager.js';
import { themeManager } from './themeManager.js';
import { uiRenderer } from './uiRenderer.js';

// Rendre les managers globaux pour uiRenderer (solution simple)
window.todoManager = todoManager;
window.notesManager = notesManager;

let currentFilter = 'all';
let currentSearchQuery = '';

function applySearchAndFilter() {
  uiRenderer.renderTodos(currentFilter, currentSearchQuery);
  uiRenderer.updateNotesSearchIndicator(currentSearchQuery);
}

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`filter-${filter}`).classList.add('active');
  applySearchAndFilter();
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialiser le thème
  themeManager.init();

  // Initialiser les notes
  uiRenderer.renderNotes();
  uiRenderer.bindNotesEvents();

  // Formulaire de tâche
  const form = document.getElementById('todo-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('todo-input');
    const deadlineInput = document.getElementById('todo-deadline');
    const text = input?.value.trim();
    const deadline = deadlineInput?.value ? new Date(deadlineInput.value).toISOString() : null;
    if (text) {
      todoManager.add(text, deadline);
      input.value = '';
      if (deadlineInput) deadlineInput.value = '';
      applySearchAndFilter();
    }
  });

  // Boutons
  document.getElementById('clear-completed')?.addEventListener('click', () => {
    todoManager.clearCompleted();
    applySearchAndFilter();
  });

  document.getElementById('export-btn')?.addEventListener('click', () => {
    const data = {
      todos: todoManager.data,
      notes_html: notesManager.data,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
    if (typeof window.jspdf === 'undefined') {
      alert('jsPDF non chargé.');
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 20;
    const margin = 15;
    const maxWidth = 180;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(20);
    doc.text("Ma Liste de Tâches & Notes", margin, y);
    y += 15;

    doc.setFontSize(14);
    doc.text("📋 Tâches", margin, y);
    y += 10;

    const todos = todoManager.data;
    if (todos.length === 0) {
      doc.setFontSize(12);
      doc.text("Aucune tâche.", margin, y);
      y += 8;
    } else {
      doc.setFontSize(12);
      todos.forEach(todo => {
        if (y > pageHeight - 30) {
          doc.addPage();
          y = 20;
        }
        const status = todo.completed ? "[✓ Terminée]" : "[ ] À faire";
        const deadline = todo.deadline 
          ? ` (Échéance : ${new Date(todo.deadline).toLocaleDateString('fr-FR')})`
          : '';
        let line = `${status} ${todo.text}${deadline}`;
        const lines = doc.splitTextToSize(line, maxWidth);
        doc.text(lines, margin, y);
        y += lines.length * 7;
      });
    }

    y += 10;
    if (y > pageHeight - 30) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.text("📝 Notes", margin, y);
    y += 10;

    const notesHtml = notesManager.data;
    let notesText = '';
    if (notesHtml) {
      const temp = document.createElement('div');
      temp.innerHTML = notesHtml;
      notesText = temp.textContent || temp.innerText || '';
    }

    if (notesText.trim() === '') {
      doc.setFontSize(12);
      doc.text("Aucune note.", margin, y);
    } else {
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(notesText, maxWidth);
      lines.forEach(line => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 7;
      });
    }

    doc.save(`todo-notes-${new Date().toISOString().slice(0, 10)}.pdf`);
  });

  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    themeManager.toggle();
  });

  document.getElementById('search-input')?.addEventListener('input', (e) => {
    currentSearchQuery = e.target.value;
    applySearchAndFilter();
  });

  document.getElementById('filter-all')?.addEventListener('click', () => setFilter('all'));
  document.getElementById('filter-active')?.addEventListener('click', () => setFilter('active'));
  document.getElementById('filter-completed')?.addEventListener('click', () => setFilter('completed'));

  // Initial render
  applySearchAndFilter();
});