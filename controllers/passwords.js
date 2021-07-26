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
        const passwords = await Password.find({owner: req.user.profile._id});
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
      if(password.owner.equals(req.user.profile._id)){
        res.render('passwords/show', {
            title: `Password: ${password.name}`,
            password,
            error: req.query.error, 
        })
      }
    } catch (error) {
        console.log(error);
        res.redirect('/passwords');
    }
}

async function decrypt(req, res){
    try {
        const password = await Password.findById(req.params.id).populate('company');
        if(password.owner.equals(req.user.profile._id)){ 
          let result = await isMasterPasswordCorrect(req.body.masterPassword, req);
          if(result.isMasterPasswordCorrect === true) {
            let decryptedPassword = decryptHelper(password.password, req.body.masterPassword);
            password.password = decryptedPassword;
            res.render('passwords/show', {
                title: `Password: ${req.body.name}`,
                password,
                error: null
            })
          }
        } else {
            throw new Error(result.errorMessage);
        }
    } catch (error){
        console.log(error);
        let queryObj = {
            'error': `${error.name}: ${error.message}`,
        }
        const query = querystring.stringify(queryObj);
        res.redirect(`/passwords/${req.params.id}/?${query}`);
    }
}

async function newPassword(req, res){
    const companies = await Company.find({});
    let renderObj = {
        title: 'Add Password', 
        companies,
        error: req.query.error, 
        namePrev: req.query.name,
        loginPrev: req.query.login,
        companyIdPrev: req.query.companyId,
        companyNamePrev: req.query.companyName
    }
    res.render('passwords/new', renderObj);
}

async function create(req, res){
    try {
        let result = await isMasterPasswordCorrect(req.body.masterPassword, req);
        if(result.isMasterPasswordCorrect === true) {
            req.body.owner = req.user.profile;
            let ciphertext = CryptoJS.AES.encrypt(req.body.password, req.body.masterPassword).toString();
            req.body.password = ciphertext;
            delete req.body.masterPassword;
            if(req.body.company === "" || req.body.company === undefined || req.body.company === null) delete req.body.company;
            await Password.create(req.body);
            res.redirect('/passwords'); 
        } else {
            throw new Error(result.errorMessage);
        }
    } catch (error) {
        console.log(error);
        let queryObj = {
            'error': `${error.name}: ${error.message}`,
            'name': req.body.name,
            'login': req.body.login,
        }
        if(req.body.company) {
            let company = await Company.findById(req.body.company);
            queryObj.companyId = String(company._id);
            queryObj.companyName = company.name;
        }
        const query = querystring.stringify(queryObj);
        res.redirect(`/passwords/new/?${query}`);
    }
}

async function edit(req, res){
    try {
      const password = await Password.findById(req.params.id).populate('company');
      const companies = await Company.find({_id: {$ne: password.company}});
      if(password.owner.equals(req.user.profile._id)){ 
        // allow user to keep their edits if they submit the wrong master password
        // does not save to database
        if(req.query.name) password.name = req.query.name;
        if(req.query.login) password.login = req.query.login;
        if(req.query.companyId) password.company_id = req.query.companyId;
        if(req.query.companyName) password.company.name = req.query.companyName;
        res.render('passwords/edit', {
            title: `Edit Password: ${req.params.id}`,
            password,
            companies,
            error: req.query.error
        })   
      }
    } catch (error) {
        console.log(error);
        res.redirect(`/passwords/${req.params.id}`);
    }
}

async function update(req, res){
    try {
        let password = await Password.findById(req.params.id);
        if(password.owner.equals(req.user.profile._id)){
            let result = await isMasterPasswordCorrect(req.body.masterPassword, req);
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
                throw new Error(result.errorMessage);
            }            
        } else {
            res.redirect(`/passwords/${password._id}`);
            throw new Error(`Not authorized`);
        }
    } catch (error) {
      console.log(error);
      let queryObj = {
        'error': `${error.name}: ${error.message}`,
        'name': req.body.name,
        'login': req.body.login,
      }
      if(req.body.company) {
        let company = await Company.findById(req.body.company);
        queryObj.companyId = String(company._id);
        queryObj.companyName = company.name;
      }
      const query = querystring.stringify(queryObj);
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

async function isMasterPasswordCorrect(attemptedMasterPassword, req){
    try {
        let firstPasswordArray = await Password.find({owner: req.user.profile._id}).sort('createdAt').limit(1);
        if(firstPasswordArray.length === 0){
            return {isMasterPasswordCorrect: true};
        } else {
            let firstPassword = firstPasswordArray[0].password;
            let decryptedPassword = decryptHelper(firstPassword, attemptedMasterPassword);
            if(decryptedPassword === "") {
                throw new Error('Incorrect master password. Please try entering it again.');
            } else {
                return {isMasterPasswordCorrect: true};
            }
        }   
    } catch (error) {
        console.log(error);
        return {
            isMasterPasswordCorrect: false,
            errorName: error.name,
            errorMessage: error.message
        }
    }
}