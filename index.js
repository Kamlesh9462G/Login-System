const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

const User = require('./model/user')

const app = express();

const uri =
    "mongodb+srv://Kamal:Kamal@123@cluster0.x0j9n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    })
    .then(() => {
        console.log("MongoDB Connected…");
    })
    .catch((err) => console.log(err));

app.use("/", express.static(path.join(__dirname, "static")));
app.use(bodyParser.json());



app.post('/api/login', async (req, res) => {
    const {
        username,
        password
    } = req.body
    const user = await User.findOne({
        username
    }).lean()

    if (!user) {
        return res.json({
            status: 'error',
            error: 'Invalid username/password'
        })
    }

    if (await bcrypt.compare(password, user.password)) {
        // the username, password combination is successful

        const token = jwt.sign({
                id: user._id,
                username: user.username
            },
            JWT_SECRET
        )

        return res.json({
            status: 'ok',
            data: token
        })
    }

    res.json({
        status: 'error',
        error: 'Invalid username/password'
    })
})

app.post("/api/register", async (req, res) => {
    const {
        username,
        password: plainTextPassword
    } = req.body

    if (!username || typeof username !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid username'
        })
    }
    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({
            status: 'error',
            error: 'Invalid password'
        })
    }


    const password = await bcrypt.hash(plainTextPassword, 10)

    try {
        const response = await User.create({
            username,
            password
        })
        console.log('User created successfully: ', response)
    } catch (error) {
        if (error.code === 11000) {
            // duplicate key
            return res.json({
                status: 'error',
                error: 'Username already in use'
            })
        }
        throw error
    }

    res.json({
        status: 'ok'
    })
});

app.listen(3000, () => {
    console.log("Server up at 3000");
});