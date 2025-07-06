const express = require('express');
const fs = require('fs');
const app = express();

//used for put operation to access the "body"
app.use(express.json());

let todos = [];

// Load todos from file asynchronously at startup
fs.readFile('todos.json', 'utf-8', (err, data) => {
    if (err) {
        console.error("Error reading the file:", err);
    } else {
        try {
            todos = JSON.parse(data);
        } catch (parseErr) {
            console.error("Error parsing JSON:", parseErr);
        }
    }
});

function saveTodosToFile() {
    fs.writeFile('todos.json', JSON.stringify(todos, null, 2), (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        }
    });
}

// Add task
app.get('/add/', (req, res) => {
    const task = req.query.task;
    if (!task) {
        return res.status(400).json({ Error: "Task is required" });
    }

    todos.push({ task: task, completeStatus: false });
    saveTodosToFile();

    res.json({ Status: "Added" });
});

// Mark task as done
app.put('/done/', (req, res) => {
    const index = parseInt(req.body.taskid) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
        return res.status(400).json({ Error: "Task ID out of bounds" });
    }

    todos[index].completeStatus = true;
    saveTodosToFile();

    res.json({ Status: "Marked as done" });
});

// Delete task
app.delete('/delete/', (req, res) => {
    const index = parseInt(req.query.taskid) - 1;

    if (isNaN(index) || index < 0 || index >= todos.length) {
        return res.status(400).json({ Error: "Task ID out of bounds" });
    }

    todos.splice(index, 1);
    saveTodosToFile();

    res.json({ Status: "Task deleted successfully" });
});

app.listen(3000);




