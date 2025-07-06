const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');

let usersDB = []; 

const app = express();
app.use(express.json());


fs.readFile('auth.json', 'utf-8', (err, data) => {
    if (err) {
        console.err("Error reading file:", err);
    }
    else {
        try {
            usersDB = JSON.parse(data);
        }
        catch (parseErr) {
            console.error("Error parsing the JSON file:", parseErr);
        }
    }
});


async function checkPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
}

async function encrypt (password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

function authenticateUser(username, plainPassword) {
    for (let i = 0; i < usersDB.length; i++) {
        if (usersDB[i].user == username) {
            const hashedPassword = usersDB[i].password;

            const match = checkPassword(plainPassword, hashedPassword);
            return match;
        }
    }
}

function checkUsername(username) {
    for (let i = 0; i < usersDB.length; i++) {
        if (usersDB[i].user == username) {
            return false;
        }
    }
    return true;
}

function generateOTP(email) {
    let otp = 0

    for (let i = 1; i < 6; i++) {
        otp += Math.floor(Math.random() * 10);
        otp *= 10;
    }

    //sendEmail(email, otp);

    return otp;

}

function saveUserInfoToFile() {
    fs.writeFile('auth.json', JSON.stringify(usersDB, null, 2), (err) => {
        if (err) {
            console.error("Error writing file:", err);
        }        
    })
}

app.post('/login/', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if (authenticateUser(username, password)) {
        
        saveUserInfoToFile();

        res.json({
            "Status" : "Login successful"
        })
        
        //take the user to index.js
    }
    else {
        res.status(400).json({
            "Error" : "Invalid login credentials"
        })
    }

})

app.post('/signup/', async function (req, res) {
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let otp = req.body.otp;

    if (!checkUsername(username)) {
        return res.json({
            "Status": "Username already exists"
        });
    }

    const generatedOTP = generateOTP(email);
    console.log("Generated OTP:", generatedOTP);

    if (otp != generatedOTP) {
        return res.json({
            "Status": "Invalid OTP"
        });
    }

    const hashedPassword = await encrypt(password);

    usersDB.push({
        user: username,
        email: email,
        password: hashedPassword,
    });

    saveUserInfoToFile();

    res.json({
        "Status": "User Created Successfully"
    });
});

app.listen(3000);