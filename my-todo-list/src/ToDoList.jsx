import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaTrash, FaCheck, FaRedo, FaGripVertical, FaRegSmileBeam, FaEdit, FaArrowDown } from "react-icons/fa";
import PropTypes from 'prop-types';
import useLocalStorage from './hooks/useLocalStorage';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { FaArrowUp } from 'react-icons/fa6';

function TaskItem({ task, index, onEdit, onDelete, onComplete, isEditing, editingTaskText, setEditingTaskText, saveEdit, cancelEdit, moveToTop, moveToBottom }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    return (
        <li role="listitem">
            {isEditing ? (
                <>
                    <input
                        ref={inputRef}
                        type="text"
                        aria-label="Edit task"
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEdit();
                            if (e.key === 'Enter') saveEdit();
                        }}
                    />
                    <button className="complete-button" onClick={saveEdit} aria-label="Save task">Save</button>
                    <button className="clear-button" onClick={cancelEdit} aria-label="Cancel editing">Cancel</button>
                </>
            ) : (
                <>
                    <span
                        className="text"
                        style={{ textDecoration: task.completed ? 'line-through' : 'none' }}
                    >
                        {task.description}
                    </span>
                    <button
                        className="edit-button"
                        onClick={() => onEdit(task.id, task.description)}
                        aria-label="Edit task"
                    >
                        <FaEdit className="icon-style" />
                    </button>
                    <button
                        className="delete-button"
                        onClick={() => onDelete(task.id)}
                        aria-label="Delete task"
                    >
                        <FaTrash className="icon-style" />
                    </button>
                    <button
                        className="complete-button"
                        onClick={() => onComplete(task.id)}
                        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                        {task.completed ? <FaRedo className="icon-style" /> : <FaCheck className="icon-style" />}
                    </button>
                    <button
                        className="move-button"
                        onClick={moveToTop}
                        aria-label="Move task to top"
                    >
                        <FaArrowUp className="icon-style" />
                    </button>
                    <button
                        className="move-button"
                        onClick={moveToBottom}
                        aria-label="Move task to bottom"
                    >
                        <FaArrowDown className="icon-style" />
                    </button>
                </>
            )}
        </li>
    );
}

TaskItem.propTypes = {
    task: PropTypes.shape({
        id: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    isEditing: PropTypes.bool.isRequired,
    editingTaskText: PropTypes.string.isRequired,
    setEditingTaskText: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    moveToTop: PropTypes.func.isRequired,
    moveToBottom: PropTypes.func.isRequired,
};

function ActiveTasksList({ tasks, onEdit, onDelete, onComplete, editingTaskId, editingTaskText, setEditingTaskText, saveEdit, cancelEdit, moveTaskToTop, moveTaskToBottom }) {
    return tasks.map((task, index) => (
        <TaskItem
            key={task.id}
            task={task}
            index={index}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            isEditing={editingTaskId === task.id}
            editingTaskText={editingTaskText}
            setEditingTaskText={setEditingTaskText}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            moveToTop={() => moveTaskToTop(task.id)}
            moveToBottom={() => moveTaskToBottom(task.id)}
        />
    ));
}

ActiveTasksList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
        })
    ).isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
    editingTaskId: PropTypes.string,
    editingTaskText: PropTypes.string.isRequired,
    setEditingTaskText: PropTypes.func.isRequired,
    saveEdit: PropTypes.func.isRequired,
    cancelEdit: PropTypes.func.isRequired,
    moveTaskToTop: PropTypes.func.isRequired,
    moveTaskToBottom: PropTypes.func.isRequired,
};

function CompletedTasksList({ tasks, onDelete, onComplete }) {
    return tasks.map((task) => (
        <li key={task.id} role="listitem">
            <span
                className="text"
                style={{ textDecoration: 'line-through' }}
            >
                {task.description || "No description available"}
            </span>
            <button
                className="delete-button"
                onClick={() => onDelete(task.id)}
                aria-label="Delete task"
            >
                <FaTrash className="icon-style" />
            </button>
            <button
                className="complete-button"
                onClick={() => onComplete(task.id)}
                aria-label="Mark as incomplete"
            >
                <FaRedo className="icon-style" />
            </button>
        </li>
    ));
}

CompletedTasksList.propTypes = {
    tasks: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
        })
    ).isRequired,
    onDelete: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
};

function ToDoList() {
    const [tasks, setTasks] = useLocalStorage('tasks', [], () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const parsed = JSON.parse(savedTasks);
            return parsed.map(task => ({
                ...task,
                description: task.description || "No description available"
            }));
        }
        return [];
    });
    const [newTask, setNewTask] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskText, setEditingTaskText] = useState("");
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        console.log("ToDoList component mounted");
    }, []);

    const addTask = useCallback(() => {
        if (newTask.trim() !== "") {
            setTasks([...tasks, { id: uuidv4(), description: newTask.trim(), completed: false }]);
            setNewTask("");
        }
    }, [newTask, tasks, setTasks]);

    const deleteTask = useCallback((id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    }, [tasks, setTasks]);

    const taskCompleted = useCallback((id) => {
        setTasks(tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    }, [tasks, setTasks]);

    const startEditingTask = useCallback((id, text) => {
        setEditingTaskId(id);
        setEditingTaskText(text);
    }, []);

    const saveEditedTask = useCallback(() => {
        if (editingTaskText.trim() !== "") {
            setTasks(tasks.map((task) =>
                task.id === editingTaskId ? { ...task, description: editingTaskText.trim() } : task
            ));
            setEditingTaskId(null);
            setEditingTaskText("");
        }
    }, [editingTaskId, editingTaskText, tasks, setTasks]);

    const cancelEditing = useCallback(() => {
        setEditingTaskId(null);
        setEditingTaskText("");
    }, []);

    const onDragEnd = useCallback(({ active, over }) => {
        if (!over) return;
        if (active.id !== over.id) {
            setTasks((tasks) => {
                const oldIndex = tasks.findIndex((task) => task.id === active.id);
                const newIndex = tasks.findIndex((task) => task.id === over.id);
                return arrayMove(tasks, oldIndex, newIndex);
            });
        }
    }, [setTasks]);

    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
    }, []);

    const clearCompletedTasks = useCallback(() => {
        setTasks(tasks.filter((task) => !task.completed));
    }, [tasks, setTasks]);

    const moveTaskToTop = useCallback((id) => {
        setTasks((tasks) => {
            const taskIndex = tasks.findIndex((task) => task.id === id);
            if (taskIndex > -1) {
                const task = tasks[taskIndex];
                const updatedTasks = [...tasks];
                updatedTasks.splice(taskIndex, 1);
                updatedTasks.unshift(task);
                return updatedTasks;
            }
            return tasks;
        });
    }, [setTasks]);

    const moveTaskToBottom = useCallback((id) => {
        setTasks((tasks) => {
            const taskIndex = tasks.findIndex((task) => task.id === id);
            if (taskIndex > -1) {
                const task = tasks[taskIndex];
                const updatedTasks = [...tasks];
                updatedTasks.splice(taskIndex, 1);
                updatedTasks.push(task);
                return updatedTasks;
            }
            return tasks;
        });
    }, [setTasks]);

    const filteredActiveTasks = useMemo(() => {
        return tasks.filter((task) => !task.completed);
    }, [tasks]);

    const filteredCompletedTasks = useMemo(() => {
        return tasks.filter((task) => task.completed);
    }, [tasks]);

    return (
        <div className="to-do-list">
            <h1>To-Do List</h1>
            <div className="input-container">
                <input
                    type="text"
                    placeholder="Enter a task"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    aria-label="New task input"
                />
                <button className="add-button" onClick={addTask} aria-label="Add task">Add Task</button>
                <button className="clear-button" onClick={() => setTasks([])} aria-label="Clear all tasks">Clear All</button>
            </div>
            <div className="filter-buttons">
                <button
                    className={filter === "all" ? "active" : ""}
                    onClick={() => handleFilterChange("all")}
                    aria-label="Show all tasks"
                >
                    All
                </button>
                <button
                    className={filter === "active" ? "active" : ""}
                    onClick={() => handleFilterChange("active")}
                    aria-label="Show active tasks"
                >
                    Active
                </button>
                <button
                    className={filter === "completed" ? "active" : ""}
                    onClick={() => handleFilterChange("completed")}
                    aria-label="Show completed tasks"
                >
                    Completed
                </button>
                <button
                    className="clear-completed-button"
                    style={{ background: "black"}}
                    onClick={clearCompletedTasks}
                    aria-label="Clear completed tasks"
                >
                    Clear Completed
                </button>
            </div>
            {filteredActiveTasks.length === 0 && filter !== "completed" ? (
                <div className="empty-state">
                    <FaRegSmileBeam className="empty-icon" aria-hidden="true" />
                    <p>Your task list is empty! Add some tasks to get started.</p>
                </div>
            ) : (
                filter !== "completed" && ( // Ensure active tasks are hidden when "completed" filter is selected
                    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={filteredActiveTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                            <ol role="list">
                                <h2>Active Tasks</h2>
                                <ActiveTasksList
                                    tasks={filteredActiveTasks}
                                    onEdit={startEditingTask}
                                    onDelete={deleteTask}
                                    onComplete={taskCompleted}
                                    editingTaskId={editingTaskId}
                                    editingTaskText={editingTaskText}
                                    setEditingTaskText={setEditingTaskText}
                                    saveEdit={saveEditedTask}
                                    cancelEdit={cancelEditing}
                                    moveTaskToTop={moveTaskToTop}
                                    moveTaskToBottom={moveTaskToBottom}
                                />
                            </ol>
                        </SortableContext>
                    </DndContext>
                )
            )}

            {filteredCompletedTasks.length > 0 && (filter === "all" || filter === "completed") && (
                <>
                    <h2>Completed Tasks</h2>
                    <ol role="list">
                        <CompletedTasksList
                            tasks={filteredCompletedTasks}
                            onDelete={deleteTask}
                            onComplete={taskCompleted}
                        />
                    </ol>
                </>
            )}
        </div>
    );
}

export default ToDoList;