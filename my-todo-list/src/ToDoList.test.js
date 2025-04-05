import { tasksReducer } from './ToDoList';

describe('tasksReducer', () => {
    it('should add a task', () => {
        const initialState = [];
        const action = {
            type: 'ADD_TASK',
            payload: { id: '1', task: 'Test Task', completed: false },
        };
        const newState = tasksReducer(initialState, action);
        expect(newState).toEqual([action.payload]);
    });

    it('should delete a task', () => {
        const initialState = [{ id: '1', task: 'Test Task', completed: false }];
        const action = { type: 'DELETE_TASK', payload: '1' };
        const newState = tasksReducer(initialState, action);
        expect(newState).toEqual([]);
    });

    it('should toggle task completion', () => {
        const initialState = [{ id: '1', task: 'Test Task', completed: false }];
        const action = { type: 'TOGGLE_TASK', payload: '1' };
        const newState = tasksReducer(initialState, action);
        expect(newState[0].completed).toBe(true);
    });

    it('should edit a task', () => {
        const initialState = [{ id: '1', task: 'Test Task', completed: false }];
        const action = {
            type: 'EDIT_TASK',
            payload: { id: '1', text: 'Updated Task' },
        };
        const newState = tasksReducer(initialState, action);
        expect(newState[0].task).toBe('Updated Task');
    });
});
