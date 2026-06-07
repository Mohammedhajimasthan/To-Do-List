let tasks = getStoredTasks();
let currentFilter = 'all';

function storageAvailable(type) {
  try {
    const storage = window[type];
    const testKey = '__storage_test__';
    storage.setItem(testKey, testKey);
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
}

function getStoredTasks() {
  if (storageAvailable('localStorage')) {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  }

  const cookieValue = getCookie('tasks');
  return cookieValue ? JSON.parse(decodeURIComponent(cookieValue)) : [];
}

function saveTasks() {
  if (storageAvailable('localStorage')) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  } else {
    setCookie('tasks', JSON.stringify(tasks), 365);
  }
}

function clearStoredTasks() {
  if (storageAvailable('localStorage')) {
    localStorage.removeItem('tasks');
  } else {
    deleteCookie('tasks');
  }
}

function initApp() {
  filterTasks(currentFilter);
  updateTaskSummary();
}

function addTask() {
  const taskText = document.getElementById('taskInput').value.trim();
  const taskDate = document.getElementById('dateInput').value;

  if (!taskText || !taskDate) {
    alert('Please enter a task and select a date.');
    return;
  }

  tasks.push({ text: taskText, date: taskDate, completed: false });
  saveTasks();
  document.getElementById('taskInput').value = '';
  document.getElementById('dateInput').value = '';
  filterTasks(currentFilter);
  updateTaskSummary();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  filterTasks(currentFilter);
  updateTaskSummary();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  filterTasks(currentFilter);
  updateTaskSummary();
}

function updateTaskSummary() {
  const count = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  document.getElementById('taskCount').textContent = `${count} task${count !== 1 ? 's' : ''}`;
  document.getElementById('completedCount').textContent = `${completed} completed`;
}

function setActiveFilter(type) {
  currentFilter = type;
  const buttons = document.querySelectorAll('.filters button');
  buttons.forEach(button => {
    button.classList.toggle('active', button.textContent.toLowerCase() === type);
  });
}

function filterTasks(type) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  setActiveFilter(type);

  const list = document.getElementById('taskList');
  list.innerHTML = '';

  const filteredTasks = tasks
    .map((task, index) => ({ task, index }))
    .filter(item => {
      const taskDate = new Date(item.task.date);
      taskDate.setHours(0, 0, 0, 0);

      if (type === 'today') return taskDate.getTime() === today.getTime();
      if (type === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return taskDate.getTime() === tomorrow.getTime();
      }
      if (type === 'future') return taskDate.getTime() > today.getTime() + 86400000;
      if (type === 'past') return taskDate.getTime() < today.getTime();
      return true;
    });

  if (filteredTasks.length === 0) {
    list.innerHTML = '<li class="empty-message">No tasks found for this filter.</li>';
    return;
  }

  filteredTasks.forEach(({ task, index }) => {
    const li = document.createElement('li');
    li.className = task.completed ? 'completed' : '';

    li.innerHTML = `
      <div class="task-row">
        <label class="task-label">
          <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="toggleComplete(${index})" />
          <span>${task.text}</span>
        </label>
        <div class="task-actions">
          <span class="task-date">${task.date}</span>
          <button class="delete-button" onclick="deleteTask(${index})">Delete</button>
        </div>
      </div>
    `;

    list.appendChild(li);
  });
}

function clearAllTasks() {
  if (!tasks.length) {
    alert('There are no tasks to clear.');
    return;
  }

  if (confirm('Are you sure you want to remove all tasks?')) {
    tasks = [];
    clearStoredTasks();
    filterTasks('all');
    updateTaskSummary();
  }
}

window.addEventListener('DOMContentLoaded', initApp);
