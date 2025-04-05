To-Do List App

A simple and interactive To-Do list built with React. This application allows users to add, remove, and organize tasks with the ability to filter completed and active tasks. Tasks are persisted in the browser's localStorage to maintain data across page reloads.

Features
Add tasks to the list.

Mark tasks as completed or active.

Remove completed tasks with a single click.

Reorder tasks: Move tasks to the top, move tasks down, or move tasks to the bottom.

Filter tasks: View only active tasks or completed tasks.

Persistence: Tasks are saved in localStorage for persistence across sessions.

Setup
To get started with this project, follow these steps:

Clone the repository:

bash
Copy
Edit
git clone https://github.com/your-username/to-do-list.git
Navigate to the project directory:

bash
Copy
Edit
cd to-do-list
Install dependencies:

bash
Copy
Edit
npm install
Start the development server:

bash
Copy
Edit
npm start
The app should now be running at http://localhost:5173.

Usage
Adding Tasks: Simply type your task in the input box and press "Add Task."

Marking Tasks: Click on a task to mark it as completed or active.

Reordering Tasks: Use the buttons next to each task to move it up, down, or to the top/bottom.

Filtering Tasks: Use the provided filter options to toggle between active and completed tasks.

Clearing Completed Tasks: Click the "Clear Completed" button to remove all completed tasks.

Custom Hook - useLocalStorage
This app uses a custom useLocalStorage hook to persist tasks. It saves tasks in the browser's localStorage, so your list remains intact after refreshing the page.

javascript
Copy
Edit
export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
Technologies Used
React

useState, useEffect, useCallback, useMemo hooks

LocalStorage API for data persistence

License
This project is open-source and available under the MIT License.

You can replace your-username in the clone URL with your actual GitHub username. Feel free to adjust sections to fit your project's unique aspects.
