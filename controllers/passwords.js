import { Password } from "../models/password.js";
import CryptoJS from "crypto-js";

export {
    newPassword as new,
    create,
    index,
    show,
    decrypt
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

async function show(req, res){
    try {
        const password = await Password.findById(req.params.id);
        res.render('passwords/show', {
            title: `${password.name}`,
            password
        })
    } catch (error) {
        console.error(error);
        res.redirect('/passwords');
    }
}

function decrypt(req, res){
    try {
        let bytes = CryptoJS.AES.decrypt(req.body.password, req.body.masterPassword);
        let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        if(decryptedPassword !== "") {
            req.body.password = decryptedPassword;
            res.render('passwords/show', {
                title: 'Password',
                password: req.body
            })
        }
    } catch (err){
        console.error(err);
    }
}

function newPassword(req, res){
    res.render('passwords/new', {title: 'Add Password'});
}

async function create(req, res){
    try {
        req.body.owner = req.user.profile;
        let ciphertext = CryptoJS.AES.encrypt(req.body.password, req.body.masterPassword).toString();
        req.body.password = ciphertext;
        delete req.body.masterPassword;
        await Password.create(req.body);
        res.redirect('/passwords');   
    } catch (error) {
        console.error(error);
        res.redirect('/passwords/new');
    }
}