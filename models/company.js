import mongoose from 'mongoose';

export {
    Company
}

const companySchema = new mongoose.Schema({
    name: {type: String, required: true},
    website: {type: String},
    description: {type: String}
})

const Company = mongoose.model('Company', companySchema);