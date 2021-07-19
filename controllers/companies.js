import { Company } from '../models/company.js';

export {
    index,
    newCompany as new,
    create
}

async function index(req, res){
    try {
        const companies = await Company.find({});
        res.render('companies/index', {
            title: 'Companies',
            companies
        })
    } catch (error) {
        console.error(error);
    }
}

function newCompany(req, res){
    res.render('companies/new', {title: 'Add Company'})
}

async function create(req, res){
    try {
        req.body.owner = req.user.profile;
        await Company.create(req.body);
        res.redirect('/companies');
    } catch (error) {
        console.error(error);
        res.redirect('/companies/new');
    }
}