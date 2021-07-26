import { Password } from '../models/password.js';

export {
    index
}

async function index (req, res) {
    try {
        let passwords;
        if(req.user){
            passwords = await Password.find({owner: req.user.profile._id});
        }
        res.render('index', {
            title: 'Deep Sky: Home',
            user: req.user ? req.user : null,
            passwords
        })
    } catch (error) {
        console.log(error);
    }
}