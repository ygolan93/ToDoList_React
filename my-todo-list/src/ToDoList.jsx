import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaTrash, FaCheck, FaRedo, FaEdit, FaArrowUp, FaArrowDown, FaRegSmileBeam } from 'react-icons/fa';
import useLocalStorage from './hooks/useLocalStorage';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import PropTypes from 'prop-types';

function ToDoList() {
    const [tasks, setTasks] = useLocalStorage('tasks', []);
    const [newTask, setNewTask] = useState("");
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingTaskText, setEditingTaskText] = useState("");
    const [filter, setFilter] = useState("all");

    // 🛠️ Reset daily tasks useEffect:
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setTasks((prevTasks) =>
            prevTasks.filter(task => {
                if (!task.createdAt) return true;
                const taskDate = task.createdAt.split('T')[0];
                return taskDate === today;
            })
        );
    }, [setTasks]);

    const addTask = useCallback(() => {
        if (newTask.trim() !== "") {
            setTasks([...tasks, {
                id: uuidv4(),
                description: newTask.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
            }]);
            setNewTask("");
        }
    }, [newTask, tasks, setTasks]);

    const deleteTask = useCallback((id) => {
        setTasks(tasks.filter(task => task.id !== id));
    }, [tasks, setTasks]);

    const taskCompleted = useCallback((id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    }, [tasks, setTasks]);

    const handleFilterChange = useCallback((newFilter) => {
        setFilter(newFilter);
    }, []);

    const clearCompletedTasks = useCallback(() => {
        setTasks(tasks.filter(task => !task.completed));
    }, [tasks, setTasks]);

    const moveTaskToTop = useCallback((id) => {
        setTasks((tasks) => {
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex > -1) {
                const updated = [...tasks];
                const [task] = updated.splice(taskIndex, 1);
                updated.unshift(task);
                return updated;
            }
            return tasks;
        });
    }, [setTasks]);

    const moveTaskToBottom = useCallback((id) => {
        setTasks((tasks) => {
            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex > -1) {
                const updated = [...tasks];
                const [task] = updated.splice(taskIndex, 1);
                updated.push(task);
                return updated;
            }
            return tasks;
        });
    }, [setTasks]);

    const filteredActiveTasks = useMemo(() => tasks.filter(task => !task.completed), [tasks]);
    const filteredCompletedTasks = useMemo(() => tasks.filter(task => task.completed), [tasks]);

    return (
        <div className="responsive-wrapper">
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
                    <button className="add-button" onClick={addTask}>Add Task</button>
                    <button className="clear-button" onClick={() => setTasks([])}>Clear All</button>
                </div>

                <div className="filter-buttons">
                    <button className={filter === "all" ? "active" : ""} onClick={() => handleFilterChange("all")}>All</button>
                    <button className={filter === "active" ? "active" : ""} onClick={() => handleFilterChange("active")}>Active</button>
                    <button className={filter === "completed" ? "active" : ""} onClick={() => handleFilterChange("completed")}>Completed</button>
                    <button onClick={clearCompletedTasks}>Clear Completed</button>
                </div>

                {filteredActiveTasks.length === 0 && filter !== "completed" ? (
                    <div className="empty-state">
                        <FaRegSmileBeam className="empty-icon" />
                        <p>Your task list is empty! Add some tasks to get started.</p>
                    </div>
                ) : (
                    filter !== "completed" && (
                        <DndContext collisionDetection={closestCenter}>
                            <SortableContext items={filteredActiveTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                                <ol>
                                    {filteredActiveTasks.map((task, index) => (
                                        <TaskItem
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onEdit={(id, text) => { setEditingTaskId(id); setEditingTaskText(text); }}
                                            onDelete={deleteTask}
                                            onComplete={taskCompleted}
                                            isEditing={editingTaskId === task.id}
                                            editingTaskText={editingTaskText}
                                            setEditingTaskText={setEditingTaskText}
                                            saveEdit={() => {
                                                setTasks(tasks.map(task =>
                                                    task.id === editingTaskId ? { ...task, description: editingTaskText } : task
                                                ));
                                                setEditingTaskId(null);
                                                setEditingTaskText("");
                                            }}
                                            cancelEdit={() => setEditingTaskId(null)}
                                            moveToTop={() => moveTaskToTop(task.id)}
                                            moveToBottom={() => moveTaskToBottom(task.id)}
                                        />
                                    ))}
                                </ol>
                            </SortableContext>
                        </DndContext>
                    )
                )}

                {filteredCompletedTasks.length > 0 && (filter === "all" || filter === "completed") && (
                    <div>
                        <h2>Completed Tasks</h2>
                        <ol>
                            {filteredCompletedTasks.map(task => (
                                <CompletedTaskItem
                                    key={task.id}
                                    task={task}
                                    onDelete={deleteTask}
                                    onComplete={taskCompleted}
                                />
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    );
}

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
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') cancelEdit();
                            if (e.key === 'Enter') saveEdit();
                        }}
                    />
                    <div className="button-group">
                        <button onClick={saveEdit} className='complete-button'>Save</button>
                        <button onClick={cancelEdit} className='delete-button'>Cancel</button>
                    </div>
                </>
            ) : (
                <>
                    <div className="task-content-inline">
                    <span className={`text ${task.completed ? 'completed' : ''}`}>
                        {task.description}
                    </span>
                    <span className="task-date">
                        {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                    </div>

                    <div className="button-group">
                        <button onClick={() => onEdit(task.id, task.description)} className="edit-button"><FaEdit /></button>
                        <button onClick={() => onDelete(task.id)} className="delete-button"><FaTrash /></button>
                        <button onClick={() => onComplete(task.id)} className="complete-button">
                        {task.completed ? <FaRedo /> : <FaCheck />}
                        </button>
                        <button onClick={moveToTop} className="move-button"><FaArrowUp /></button>
                        <button onClick={moveToBottom} className="move-button"><FaArrowDown /></button>
                    </div>
                </>
            )}
        </li>
    );
}

function CompletedTaskItem({ task, onDelete, onComplete }) {
    return (
        <li role="listitem">
            <div className="task-content-inline completed-layout">
            <span className="text">{task.description}</span>
            <div className="completed-meta">
                <span className="task-date">{new Date(task.createdAt).toLocaleDateString()}</span>
                <FaCheck className="completed-icon" />
            </div>
            </div>
            <div className="button-group">
                <button onClick={() => onDelete(task.id)} className='clear-button'><FaTrash /></button>
                <button onClick={() => onComplete(task.id)} className='move-button'><FaRedo /></button>
            </div>
        </li>
    );
}

TaskItem.propTypes = {
    task: PropTypes.object.isRequired,
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

CompletedTaskItem.propTypes = {
    task: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired,
    onComplete: PropTypes.func.isRequired,
};

export default ToDoList;
