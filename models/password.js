import mongoose from 'mongoose'

export {
    Password
}

const passwordSchema = new mongoose.Schema({
  name: {type: String, required: true},
  password: {type: String, required: true},
  login: {type: String, required: true},
  company: {type: mongoose.Schema.Types.ObjectId, ref: "Company"},
  owner: {type: mongoose.Schema.Types.ObjectId, ref: "Profile"}
}, {
  timestamps: true
})

const Password = mongoose.model('Password', passwordSchema)