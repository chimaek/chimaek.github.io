// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const activeCount = document.getElementById('activeCount');
const prioritySelect = document.getElementById('prioritySelect');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompleted = document.getElementById('clearCompleted');
const darkModeToggle = document.getElementById('darkModeToggle');

// 할 일 목록 배열
let todos = [];
let currentFilter = 'all';

// 로컬 스토리지에서 데이터 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
    }

    // 다크 모드 설정 불러오기
    const darkMode = localStorage.getItem('darkMode');
    if (darkMode === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
}

// 로컬 스토리지에 데이터 저장하기
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// 할 일 추가
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('할 일을 입력해주세요!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: prioritySelect.value,
        createdAt: new Date().toISOString()
    };

    todos.push(todo);
    todoInput.value = '';
    prioritySelect.value = 'medium';
    saveTodos();
    renderTodos();
}

// 할 일 삭제
function deleteTodo(id) {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

// 할 일 완료 상태 토글
function toggleComplete(id) {
    const todo = todos.find(todo => todo.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

// 할 일 편집
function editTodo(id) {
    const todo = todos.find(todo => todo.id === id);
    if (!todo) return;

    const todoItem = document.querySelector(`[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const currentText = todo.text;

    // 편집 입력창 생성
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;

    // 입력창으로 교체
    todoText.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // 편집 완료 함수
    const finishEdit = () => {
        const newText = editInput.value.trim();
        if (newText && newText !== currentText) {
            todo.text = newText;
            saveTodos();
        }
        renderTodos();
    };

    // Enter 키로 편집 완료
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEdit();
        }
    });

    // 포커스 잃으면 편집 완료
    editInput.addEventListener('blur', finishEdit);
}

// 완료된 할 일 모두 삭제
function clearCompletedTodos() {
    const completedTodos = todos.filter(todo => todo.completed);
    if (completedTodos.length === 0) {
        alert('완료된 항목이 없습니다.');
        return;
    }

    if (confirm(`${completedTodos.length}개의 완료된 항목을 삭제하시겠습니까?`)) {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    }
}

// 필터링된 할 일 가져오기
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    activeCount.textContent = active;

    // 완료된 항목 삭제 버튼 활성화/비활성화
    clearCompleted.disabled = completed === 0;
}

// 우선순위 텍스트 가져오기
function getPriorityText(priority) {
    const priorityMap = {
        high: '높음',
        medium: '보통',
        low: '낮음'
    };
    return priorityMap[priority] || '보통';
}

// 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        const emptyMessage = currentFilter === 'all'
            ? '아직 할 일이 없습니다.'
            : currentFilter === 'active'
            ? '진행 중인 할 일이 없습니다.'
            : '완료된 할 일이 없습니다.';

        todoList.innerHTML = `<li class="empty-state">${emptyMessage}</li>`;
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <span class="priority-badge priority-${todo.priority}">${getPriorityText(todo.priority)}</span>
                <button class="edit-btn">편집</button>
                <button class="delete-btn">삭제</button>
            `;

            // 체크박스 이벤트
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleComplete(todo.id));

            // 텍스트 더블클릭으로 편집
            const todoTextEl = li.querySelector('.todo-text');
            todoTextEl.addEventListener('dblclick', () => editTodo(todo.id));

            // 편집 버튼 이벤트
            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => editTodo(todo.id));

            // 삭제 버튼 이벤트
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(li);
        });
    }

    updateStats();
}

// 필터 변경
function setFilter(filter) {
    currentFilter = filter;

    // 필터 버튼 활성화 상태 변경
    filterBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// 다크 모드 토글
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode);
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

clearCompleted.addEventListener('click', clearCompletedTodos);
darkModeToggle.addEventListener('click', toggleDarkMode);

// 초기 로드
loadTodos();
