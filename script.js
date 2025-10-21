// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');

// 할 일 목록 배열
let todos = [];

// 로컬 스토리지에서 데이터 불러오기
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
        renderTodos();
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
        completed: false
    };

    todos.push(todo);
    todoInput.value = '';
    saveTodos();
    renderTodos();
}

// 할 일 삭제
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
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

// 통계 업데이트
function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;

    totalCount.textContent = total;
    completedCount.textContent = completed;
}

// 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">아직 할 일이 없습니다.</li>';
    } else {
        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <button class="delete-btn">삭제</button>
            `;

            // 체크박스 이벤트
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleComplete(todo.id));

            // 삭제 버튼 이벤트
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            todoList.appendChild(li);
        });
    }

    updateStats();
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 초기 로드
loadTodos();
