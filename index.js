const express = require("express");
const fs = require("fs"); // Import the fs module
const path = require("path");

const app = express();
const users = require("./MOCK_DATA.json"); // Renamed to `users` to avoid confusion

const PORT = 8000;

app.use(express.json()); // Middleware to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies

const updateUsersFile = (updatedUsers) => {
    fs.writeFileSync(path.join(__dirname, "MOCK_DATA.json"), JSON.stringify(updatedUsers, null, 2));
};

app.get("/api/user", (req, res) => {
    res.json(users);
});

app.get("/user", (req, res) => {
    const html = `
        <ul>
            ${users.map((user) => `<li>${user.first_name}</li>`).join('')}
        </ul>
    `;
    res.send(html);
});

app.route("/api/user/:id")
    .get((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    })
    .post((req, res) => {
        const id = Number(req.params.id);
        const existingUser = users.find((user) => user.id === id);

        // Log the request body to the console
        console.log("Request Body:", req.body);

        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
        } else {
            const newUser = { id, ...req.body };
            users.push(newUser);
            updateUsersFile(users); // Update the file with the new users array
            res.status(201).json(newUser);
        }
    })
    .patch((req, res) => {
        const id = Number(req.params.id);
        const user = users.find((user) => user.id === id);
        if (user) {
            Object.assign(user, req.body);
            updateUsersFile(users); // Update the file with the modified users array
            res.json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    })
    .delete((req, res) => {
        const id = Number(req.params.id);
        const index = users.findIndex((user) => user.id === id);
        if (index !== -1) {
            users.splice(index, 1);
            updateUsersFile(users); // Update the file after removing the user
            res.status(204).send();
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });

// Handle non-existent routes
app.use((req, res) => {
    res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
