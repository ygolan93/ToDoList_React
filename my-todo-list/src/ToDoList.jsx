import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs

function ToDoList() {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem('tasks');
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [newTask, setNewTask] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskText, setEditingTaskText] = useState("");

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    function handleInputChange(event) {
        setNewTask(event.target.value);
    }

    function addTask() {
        if (newTask.trim() !== "") {
            const newTaskObj = {
                id: uuidv4(), // Generate unique ID
                task: newTask,
                completed: false,
            };
            setTasks((prevTasks) => [...prevTasks, newTaskObj]);
            setNewTask("");
        }
    }

    function deleteTask(id) {
        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
    }

    function taskCompleted(id) {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }

    function clearAllTasks() {
        setTasks([]);
    }

    function startEditingTask(id, text) {
        setEditingTaskId(id);
        setEditingTaskText(text);
    }

    function saveEditedTask() {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === editingTaskId ? { ...task, task: editingTaskText } : task
            )
        );
        setEditingTaskId(null);
        setEditingTaskText("");
    }

    function cancelEditing() {
        setEditingTaskId(null);
        setEditingTaskText("");
    }

    function moveTaskUp(id) {
        setTasks((prevTasks) => {
            const index = prevTasks.findIndex((task) => task.id === id);
            if (index > 0) {
                const updatedTasks = [...prevTasks];
                [updatedTasks[index - 1], updatedTasks[index]] = [updatedTasks[index], updatedTasks[index - 1]];
                return updatedTasks;
            }
            return prevTasks;
        });
    }

    function moveTaskDown(id) {
        setTasks((prevTasks) => {
            const index = prevTasks.findIndex((task) => task.id === id);
            if (index < prevTasks.length - 1) {
                const updatedTasks = [...prevTasks];
                [updatedTasks[index], updatedTasks[index + 1]] = [updatedTasks[index + 1], updatedTasks[index]];
                return updatedTasks;
            }
            return prevTasks;
        });
    }

    return (
        <div className='to-do-list'>
            <h1>To-Do-List</h1>
            <div className='input-container'>
                <input
                    type='text'
                    placeholder='Enter a task'
                    value={newTask}
                    onChange={handleInputChange}
                />
                <button className='add-button' onClick={addTask}>Add Task</button>
                <button className='clear-button' onClick={clearAllTasks}>Clear All</button>
            </div>

            <ol>
                {tasks
                    .filter((task) => !task.completed) // Exclude completed tasks
                    .map((task, index) => (
                        <li key={task.id}>
                            {editingTaskId === task.id ? (
                                <>
                                    <input
                                        type='text'
                                        value={editingTaskText}
                                        onChange={(e) => setEditingTaskText(e.target.value)}
                                    />
                                    <button onClick={saveEditedTask}>Save</button>
                                    <button onClick={cancelEditing}>Cancel</button>
                                </>
                            ) : (
                                <>
                                    <span
                                        className='text'
                                        style={{
                                            textDecoration: task.completed ? 'line-through' : 'none',
                                        }}
                                        onDoubleClick={() => startEditingTask(task.id, task.task)}
                                    >
                                        {task.task}
                                    </span>
                                    <button className='delete-button' onClick={() => deleteTask(task.id)}>🗑️</button>
                                    <button
                                        className='complete-button'
                                        onClick={() => taskCompleted(task.id)}
                                    >
                                        {task.completed ? "↩" : "✔"}
                                    </button>
                                    <button
                                        className='move-button'
                                        onClick={() => moveTaskUp(task.id)}
                                        disabled={index === 0}
                                    >
                                        ↑
                                    </button>
                                    <button
                                        className='move-button'
                                        onClick={() => moveTaskDown(task.id)}
                                        disabled={index === tasks.filter((t) => !t.completed).length - 1}
                                    >
                                        ↓
                                    </button>
                                </>
                            )}
                        </li>
                    ))}
            </ol>

            {tasks.some((task) => task.completed) && (
                <>
                    <h2>Completed Tasks</h2>
                    <ol>
                        {tasks
                            .filter((task) => task.completed)
                            .map((task) => (
                                <li key={task.id}>
                                    <span
                                        className='text'
                                        style={{ textDecoration: 'line-through' }}
                                    >
                                        {task.task}
                                    </span>
                                    <button className='delete-button' onClick={() => deleteTask(task.id)}>🗑️</button>
                                    <button
                                        className='complete-button'
                                        onClick={() => taskCompleted(task.id)}
                                    >
                                        ↩
                                    </button>
                                </li>
                            ))}
                    </ol>
                </>
            )}
        </div>
    );
}

export default ToDoList;