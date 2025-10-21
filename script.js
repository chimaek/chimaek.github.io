// DOM 요소 가져오기
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');

// 할 일 목록 배열
let todos = [];
let currentFilter = 'all';
let searchQuery = '';

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

// 완료 삭제 버튼 업데이트
function updateClearButton() {
    const hasCompleted = todos.some(todo => todo.completed);
    clearCompletedBtn.disabled = !hasCompleted;
}

// 할 일 필터링 및 검색
function getFilteredTodos() {
    let filtered = todos;

    // 필터 적용
    if (currentFilter === 'active') {
        filtered = filtered.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(todo => todo.completed);
    }

    // 검색 적용
    if (searchQuery.trim() !== '') {
        filtered = filtered.filter(todo =>
            todo.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    return filtered;
}

// 할 일 수정
function editTodo(id, newText) {
    const todo = todos.find(todo => todo.id === id);
    if (todo && newText.trim() !== '') {
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
    }
}

// 완료된 할 일 모두 삭제
function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
}

// 할 일 목록 렌더링
function renderTodos() {
    todoList.innerHTML = '';
    const filteredTodos = getFilteredTodos();

    if (filteredTodos.length === 0) {
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="empty-state">아직 할 일이 없습니다.</li>';
        } else {
            todoList.innerHTML = '<li class="empty-state">검색 결과가 없습니다.</li>';
        }
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${todo.text}</span>
                <input type="text" class="edit-input" value="${todo.text}">
                <button class="delete-btn">삭제</button>
            `;

            // 체크박스 이벤트
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleComplete(todo.id));

            // 삭제 버튼 이벤트
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

            // 더블클릭으로 수정 모드
            const todoText = li.querySelector('.todo-text');
            const editInput = li.querySelector('.edit-input');

            todoText.addEventListener('dblclick', () => {
                li.classList.add('editing');
                editInput.focus();
                editInput.select();
            });

            // 수정 입력 이벤트
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    editTodo(todo.id, editInput.value);
                }
            });

            editInput.addEventListener('blur', () => {
                if (li.classList.contains('editing')) {
                    editTodo(todo.id, editInput.value);
                }
            });

            todoList.appendChild(li);
        });
    }

    updateStats();
    updateClearButton();
}

// 이벤트 리스너
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// 검색 기능
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTodos();
});

// 필터 기능
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 모든 버튼에서 active 클래스 제거
        filterBtns.forEach(b => b.classList.remove('active'));
        // 클릭된 버튼에 active 클래스 추가
        btn.classList.add('active');
        // 현재 필터 업데이트
        currentFilter = btn.dataset.filter;
        renderTodos();
    });
});

// 완료 항목 삭제 버튼
clearCompletedBtn.addEventListener('click', () => {
    if (confirm('완료된 모든 항목을 삭제하시겠습니까?')) {
        clearCompleted();
    }
});

// 초기 로드
loadTodos();
