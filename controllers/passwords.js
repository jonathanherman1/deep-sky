import { Password } from "../models/password.js";
import { Company } from '../models/company.js';
import CryptoJS from "crypto-js";
import querystring from 'querystring';

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
        console.log(error);
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
        console.log(error);
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
        } else {
            res.redirect(`/passwords/${req.params.id}`);
        }
    } catch (err){
        console.log(err);
        res.redirect(`/passwords/${req.params.id}`);
    }
}

async function newPassword(req, res){
    const companies = await Company.find({});
    res.render('passwords/new', {
        title: 'Add Password', 
        companies,
        error: req.query.error, 
        namePrev: req.query.name,
        loginPrev: req.query.login,
        passwordPrev: req.query.password,
        companyPrev: req.query.companyId,
        companyNamePrev: req.query.companyName
    });
}

async function create(req, res){
    try {
        let result = await isMasterPasswordCorrect(req.body.masterPassword);
        console.log("isMasterPassword RESULT!!! ", result);
        if(result.isMasterPasswordCorrect === true) {
            req.body.owner = req.user.profile;
            let ciphertext = CryptoJS.AES.encrypt(req.body.password, req.body.masterPassword).toString();
            req.body.password = ciphertext;
            delete req.body.masterPassword;
            if(req.body.company === "" || req.body.company === undefined || req.body.company === null) delete req.body.company;
            await Password.create(req.body);
            res.redirect('/passwords'); 
        } else {
            // throw new Error('Incorrect master password. Please try entering it again.');
            throw new Error(result.errorMessage);
        }
    } catch (error) {
        console.log(error);
        let companyId;
        let companyName;
        if(req.body.company) {
            console.log("INSIDE MAN: ", req.body.company)
            company = await Company.findById(req.body.company);
            companyId = company._id;
            companyName = company.name;
        }
        const query = querystring.stringify({
            'error': `${error.name}: ${error.message}`,
            'name': req.body.name,
            'login': req.body.login,
            'password': req.body.password,
            'companyId': companyId,
            'companyName': companyName
        });
        res.redirect(`/passwords/new/?${query}`);
    }
}

async function edit(req, res){
    try {
        const password = await Password.findById(req.params.id).populate('company');
        const companies = await Company.find({_id: {$ne: password.company}});
        res.render('passwords/edit', {
            title: `Edit Password: ${req.params.id}`,
            password,
            companies,
            error: req.query.error, 
            namePrev: req.query.name,
            loginPrev: req.query.login,
            passwordPrev: req.query.password,
            companyPrev: req.query.companyId,
            companyNamePrev: req.query.companyName
        })   
    } catch (error) {
        console.log(error);
        res.redirect(`/passwords/${req.params.id}`);
    }
}

async function update(req, res){
    try {
        let password = await Password.findById(req.params.id);
        if(password.owner.equals(req.user.profile._id)){
            let result = await isMasterPasswordCorrect(req.body.masterPassword);
            if(result.isMasterPasswordCorrect === true) {
                if(req.body.company === '') {
                    req.body.company = null;
                }
                if(password.password === req.body.password){
                    delete req.body.masterPassword;
                    await password.updateOne(req.body, {new: true, omitUndefined: true});
                    res.redirect(`/passwords/${password._id}`);
                } else {
                    let ciphertext = CryptoJS.AES.encrypt(req.body.password, req.body.masterPassword).toString();
                    req.body.password = ciphertext;
                    delete req.body.masterPassword;
                    await password.updateOne(req.body, {new: true});
                    res.redirect(`/passwords/${password._id}`);
                }
            } else {
                res.redirect(`/passwords/${password._id}/edit`);
            }            
        } else {
            res.redirect(`/passwords/${password._id}`);
            throw new Error(`Not authorized`);
        }
    } catch (error) {
      console.log(error);
      let company = await Company.findById(req.body.company);
      let companyName = company.name;
      const query = querystring.stringify({
          'error': `${error.name}: ${error.message}`,
          'name': req.body.name,
          'login': req.body.login,
          'password': req.body.password,
          'companyId': req.body.company,
          'companyName': companyName
      });
      res.redirect(`/passwords/${req.params.id}/edit/?${query}`);
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
        console.log(error);
        res.redirect('/passwords');
    }
}

function decryptHelper(passwordToDecrypt, masterPassword){
    let bytes = CryptoJS.AES.decrypt(passwordToDecrypt, masterPassword);
    return bytes.toString(CryptoJS.enc.Utf8);
}

async function isMasterPasswordCorrect(attemptedMasterPassword){
    try {
        let firstPasswordArray = await Password.find({}).sort('createdAt').limit(1);
        console.log("first password array: ", firstPasswordArray);
        console.log("first password array length: ", firstPasswordArray.length);
        if(firstPasswordArray.length === 0){
            return {isMasterPasswordCorrect: true};
        } else {
            let firstPassword = firstPasswordArray[0].password;
            console.log("first pass word: ", firstPassword)
            let decryptedPassword = decryptHelper(firstPassword, attemptedMasterPassword);
            console.log("decrypted password: ", decryptedPassword)
            if(decryptedPassword === "") {
                throw new Error('Incorrect master password. Please try entering it again.');
            } else {
                return {isMasterPasswordCorrect: true};
            }
        }   
    } catch (error) {
        console.log("isMasterPasswordCorrect ERROR: ", error);
        return {
            isMasterPasswordCorrect: false,
            errorName: error.name,
            errorMessage: error.message
        }
    }
}