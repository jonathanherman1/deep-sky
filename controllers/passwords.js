import { Password } from "../models/password.js";
import { Company } from '../models/company.js';
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
        const password = await Password.findById(req.params.id)
          .populate('company');
        res.render('passwords/show', {
            title: `Password: ${password.name}`,
            password
        })
    } catch (error) {
        console.error(error);
        res.redirect('/passwords');
    }
}

async function decrypt(req, res){
    try {
        let bytes = CryptoJS.AES.decrypt(req.body.password, req.body.masterPassword);
        let decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        if(decryptedPassword !== "") {
            const password = await Password.findById(req.params.id).populate('company');
            password.password = decryptedPassword;
            res.render('passwords/show', {
                title: `Password: ${req.body.name}`,
                password
            })
        }
    } catch (err){
        console.error(err);
    }
}

async function newPassword(req, res){
    const companies = await Company.find({});
    res.render('passwords/new', {title: 'Add Password', companies});
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