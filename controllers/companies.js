import { Company } from '../models/company.js';
import { Password } from '../models/password.js';

export {
    index,
    show,
    newCompany as new,
    create,
    update,
    deleteCompany as delete
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

async function show(req, res){
    try {
        const company = await Company.findById(req.params.id)
        console.log(req.query.error)
        if(req.query.error === 'invalidDelete') {
            req.query.error = 'Cannot delete company: has references'
            console.log(req.query.error)
        }
        res.render('companies/show', {
            title: `Company: ${company.name}`,
            company, 
            error: req.query.error
        })
    } catch (error) {
        console.error(error);
        res.redirect('/companies');
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

async function update(req, res){
    try {
        let company = await Company.findById(req.params.id);
        if(company.owner.equals(req.user.profile._id)){
            await company.update(req.body, {new: true});
            res.redirect(`/companies/${company._id}`); 
        } else {
            throw new Error(`Not authorized`);
        }
    } catch (error) {
      console.error(error);
      res.redirect('/companies');
    }
}

async function deleteCompany(req, res){
    try {
        let company = await Company.findById(req.params.id);
        if(company.owner.equals(req.user.profile._id)){
            const match = await Password.find({}).where('company').equals(company._id).limit(1);
            if(match) {
                throw new Error('Cannot delete company: has references');
            } else {
                await company.delete();
                res.redirect('/companies');
            }
        } else {
            throw new Error('Not authorized');
        }
    } catch (error) {
        console.error(error);
        res.redirect(`/companies/${req.params.id}/?error=invalidDelete`);
    }
}