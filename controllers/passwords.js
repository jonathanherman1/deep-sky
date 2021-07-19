import { Password } from "../models/password.js";
import { Company } from '../models/company.js';
import CryptoJS from "crypto-js";

export {
    newPassword as new,
    create,
    index,
    show,
    decrypt,
    edit,
    update,
    deletePassword as delete
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
        res.redirect(`/passwords/${req.params.id}`);
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
        if(req.body.company === "") delete req.body.company;
        await Password.create(req.body);
        res.redirect('/passwords');   
    } catch (error) {
        console.error(error);
        res.redirect('/passwords/new');
    }
}

async function edit(req, res){
    try {
        const password = await Password.findById(req.params.id).populate('company');
        const companies = await Company.find({_id: {$ne: password.company}});
        res.render('passwords/edit', {
            title: `Edit Password: ${req.params.id}`,
            password,
            companies
        })   
    } catch (error) {
        console.error(error);
        res.redirect(`/passwords/${req.params.id}`);
    }
}

async function update(req, res){
    try {
        let password = await Password.findById(req.params.id);
        if(password.owner.equals(req.user.profile._id)){
            if(password.password === req.body.password){
                delete req.body.masterPassword;
                await password.update(req.body, {new: true});
                res.redirect(`/passwords/${password._id}`);
            } else {
                let ciphertext = CryptoJS.AES.encrypt(req.body.password, req.body.masterPassword).toString();
                req.body.password = ciphertext;
                delete req.body.masterPassword;
                await password.update(req.body, {new: true});
                res.redirect(`/passwords/${password._id}`);
            }
            
        } else {
            throw new Error(`Not authorized`);
        }
    } catch (error) {
      console.error(error);
      res.redirect('/passwords');
    }
}

async function deletePassword(req, res){
    try {
        let password = await Password.findById(req.params.id);
        if(password.owner.equals(req.user.profile._id)){
            await password.delete();
            res.redirect('/passwords');
        } else {
            throw new Error('Not authorized');
        }
    } catch (error) {
        console.error(error);
        res.redirect('/passwords');
    }
}