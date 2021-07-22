import { Password } from '../models/password.js';

export {
    index
}

async function index (req, res) {
    try {
        const passwords = await Password.find({});
        res.render('index', {
            title: 'Deep Sky: Home',
            user: req.user ? req.user : null,
            passwords
        })
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
}