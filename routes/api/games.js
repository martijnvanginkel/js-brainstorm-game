const express = require('express');
const router = express.Router();
const Game = require('./../../models/game');
const User = require('./../../models/user');
const Word = require('./../../models/word');

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

const checkForAddOn = (cur_users, new_user) => {
    let duplicants = 0;
    cur_users.forEach(user => {
        if (user.name == new_user) {
            duplicants++;
        }
    });
    return ` (${duplicants})`
}

const filterOnlineUsers = (user) => user.in_game === true;
const findUserById = (id) => (user_el) => user_el.id === id;

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
        key: generateRandomKey(),
        open: true,
        subject: ""
    });
    try {
        const new_game = await game.save();
        res.status(201).json(new_game); // 201 is successful object created
    }
    catch (error) {
        res.status(400).json({ message: error.message }); // 400 is user gives wrong input and not with server
    }
});

router.get('/:key/get_users', async (req, res) => {
    try {
        const game = await Game.findOne({ key: req.params.key });
        const users = game.users.filter(filterOnlineUsers);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:key/add_user/:user', async (req, res) => {
    try {
        const game = await Game.findOne({ key: req.params.key });
        const new_user = new User({
            name: req.params.user,
            name_add_on: checkForAddOn(game.users, req.params.user),
            lobby_ready: false,
            in_game: true
        });
        game.users.push(new_user);
        await game.save();
        res.json(new_user);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:key/set_user_ready/:user_id', async (req, res) => {
    try {
        const game = await Game.findOne({ key: req.params.key });
        const user = game.users.find(findUserById(req.params.user_id))
        user.lobby_ready = true;
        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }  
});

router.put('/:key/remove_user/:user_id', async (req, res) => {
    try {
        const game = await Game.findOne({key: req.params.key});
        const users = game.users;
        users.forEach((user) => {
            user.lobby_ready = false;
            if (user.id == req.params.user_id) {
                user.in_game = false;
            }
        });
        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/lock_game/:key', async (req, res) => {
    try {
        const game = await Game.findOne({key: req.params.key});
        game.open = false;
        await game.save();
        res.json(game);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:key/update_subject/:subject', async (req, res) => {
    try {
        const game = await Game.findOne({key: req.params.key});
        game.subject = req.params.subject;
        await game.save();
        res.json(game.subject);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

router.put('/:key/new_word/:word', async (req, res) => {
    try {
        const game = await Game.findOne({key: req.params.key});
        const word = new Word({
            value: req.params.word
        });
        game.words.push(word);
        await game.save();
        res.json(word);
    } catch (error) {
        res.status(500).json({ message: error.message })
    } 
});

module.exports = router;