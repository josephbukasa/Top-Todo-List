import { formatDate, isOverdue } from './utils.js';

let currentSearchQuery = '';

export const uiRenderer = {
  renderTodos(filter = 'all', searchQuery = '') {
    currentSearchQuery = searchQuery.toLowerCase().trim();
    const list = document.getElementById('todo-list');
    const countEl = document.getElementById('remaining-count');
    
    if (countEl) {
      const count = window.todoManager.remainingCount;
      countEl.textContent = `${count} tâche${count > 1 ? 's' : ''} restante${count > 1 ? 's' : ''}`;
    }

    if (!list) return;

    let todos = window.todoManager.filtered(filter);
    if (currentSearchQuery) {
      todos = todos.filter(todo =>
        todo.text.toLowerCase().includes(currentSearchQuery)
      );
    }

    list.innerHTML = '';

    todos.forEach((todo, visualIndex) => {
      const realIndex = window.todoManager.data.findIndex(t => t === todo);
      const li = document.createElement('li');
      li.className = todo.completed ? 'completed' : '';
      if (todo.deadline && isOverdue(todo.deadline)) {
        li.style.backgroundColor = '#ffebee';
      }

      const itemDiv = document.createElement('div');
      itemDiv.className = 'todo-item';

      const textDiv = document.createElement('div');
      textDiv.className = 'todo-text';
      const span = document.createElement('span');
      span.textContent = todo.text;
      const dateSpan = document.createElement('div');
      dateSpan.className = 'todo-date';
      dateSpan.textContent = `Créée le : ${formatDate(todo.createdAt)}`;
      textDiv.appendChild(span);
      textDiv.appendChild(dateSpan);

      if (todo.deadline) {
        const deadlineEl = document.createElement('div');
        deadlineEl.className = 'deadline';
        deadlineEl.textContent = `Échéance : ${formatDate(todo.deadline)}`;
        if (isOverdue(todo.deadline)) {
          deadlineEl.style.color = '#c0392b';
        }
        textDiv.appendChild(deadlineEl);
      }

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'todo-actions';

      const completeBtn = document.createElement('button');
      completeBtn.className = 'btn-complete';
      completeBtn.textContent = todo.completed ? 'Annuler' : 'Terminer';
      completeBtn.onclick = () => {
        window.todoManager.toggleComplete(realIndex);
        this.renderTodos(filter, currentSearchQuery);
      };

      const editBtn = document.createElement('button');
      editBtn.className = 'btn-complete';
      editBtn.textContent = 'Modifier';
      editBtn.onclick = () => this.startEditing(li, realIndex, todo.text, filter);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete';
      deleteBtn.textContent = 'Supprimer';
      deleteBtn.onclick = () => {
        window.todoManager.delete(realIndex);
        this.renderTodos(filter, currentSearchQuery);
      };

      actionsDiv.appendChild(completeBtn);
      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(deleteBtn);

      itemDiv.appendChild(textDiv);
      itemDiv.appendChild(actionsDiv);
      li.appendChild(itemDiv);
      list.appendChild(li);
    });
  },

  startEditing(li, index, currentText, currentFilter) {
    const textDiv = li.querySelector('.todo-text');
    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.className = 'edit-input';
    inputEdit.value = currentText;
    inputEdit.style.width = '100%';
    inputEdit.style.padding = '8px';
    inputEdit.style.margin = '4px 0';

    const dateEl = textDiv.querySelector('.todo-date');
    const deadlineEl = textDiv.querySelector('.deadline');

    textDiv.innerHTML = '';
    textDiv.appendChild(inputEdit);
    if (dateEl) textDiv.appendChild(dateEl);
    if (deadlineEl) textDiv.appendChild(deadlineEl);

    inputEdit.focus();

    const saveEdit = () => {
      window.todoManager.update(index, inputEdit.value);
      this.renderTodos(currentFilter, currentSearchQuery);
    };

    inputEdit.addEventListener('blur', saveEdit);
    inputEdit.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveEdit();
        inputEdit.blur();
      }
    });
  },

  renderNotes() {
    const editor = document.getElementById('notes-editor');
    if (editor) {
      editor.innerHTML = window.notesManager.data || '';
    }
  },

  bindNotesEvents() {
    const editor = document.getElementById('notes-editor');
    if (!editor) return;

    editor.addEventListener('input', () => {
      window.notesManager.data = editor.innerHTML;
    });

    const toolbar = document.querySelector('.toolbar');
    toolbar?.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        const command = e.target.dataset.command;
        document.execCommand(command, false, null);
        editor.focus();
        window.notesManager.data = editor.innerHTML;
      }
    });
  },

  updateNotesSearchIndicator(searchQuery) {
    const notesSection = document.querySelector('.notes-section');
    if (!notesSection) return;

    const badge = notesSection.querySelector('.search-match-badge');
    if (badge) badge.remove();

    if (!searchQuery.trim()) return;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = window.notesManager.data;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    if (plainText.toLowerCase().includes(searchQuery.toLowerCase())) {
      const newBadge = document.createElement('span');
      newBadge.className = 'search-match-badge';
      newBadge.textContent = '🔍 Résultat dans les notes';
      notesSection.querySelector('h2')?.appendChild(newBadge);
    }
  }
};