const express = require('express');
const router = express.Router();
const Game = require('./../../models/game');
const User = require('./../../models/user');

const generateRandomKey = () => {
    let key_code = '';
    const key_length = 14;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const chars_length = chars.length;

    for (let i = 0; i < key_length; i++) {
        key_code += chars[Math.floor(Math.random() * chars_length)];
    }
    return key_code;
}

router.get('/:key', async (req, res) => {
    try {
        const game = await Game.findOne({ key: req.params.key });
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post('/new', async (req, res) => {
    const game = new Game({
        key: generateRandomKey()
    });
    try {
        const new_game = await game.save();
        res.status(201).json(new_game); // 201 is successful object created
    }
    catch (error) {
        res.status(400).json({ message: error.message }); // 400 is user gives wrong input and not with server
    }
});

router.put('/:key/add_user/:user', async (req, res) => {
    try {
        const game = await Game.findOne({ key: req.params.key });
        const user = new User({
            name: req.params.user,
            in_game: true
        });
        game.users.push(user);
        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;