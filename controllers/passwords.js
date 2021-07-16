import { Password } from "../models/password.js";

export {
    newPassword as new,
    create,
    index
}

async function index(req, res){
    try {
        const passwords = await Password.find({});
        res.render('passwords/index', {
            title: 'Passwords',
            passwords
        })
    } catch (error) {
        console.error(error);
        res.redirect('/passwords');
    }
}

function newPassword(req, res){
    res.render('passwords/new', {title: 'Add Password'});
}

async function create(req, res){
    try {
        req.body.owner = req.user.profile;
        await Password.create(req.body);
        res.redirect('/passwords');   
    } catch (error) {
        console.error(error);
        res.redirect('/passwords/new');
    }
}