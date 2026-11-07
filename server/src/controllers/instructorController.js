import { Instructor } from '../models/Instructor.js';
import bcrypt from 'bcryptjs';
import Joi from 'joi';

const loginSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  password: Joi.string().min(6).max(100).required(),
});

const searchSchema = Joi.object({
  name: Joi.string().trim().max(50),
  department: Joi.string().trim().max(50),
}).unknown(true); // FIXED: allow unrelated keys through; only name/department are ever read

function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role,
  };
}

export async function loginInstructor(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: 'Invalid input' });
    }

    const instructor = await Instructor.findOne({ username: value.username }).select('+password');
    const isMatch = instructor && (await bcrypt.compare(value.password, instructor.password));
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({ instructor: publicProfile(instructor) });
  } catch (err) {
    next(err);
  }
}

export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();
    res.json({ instructors });
  } catch (err) {
    next(err);
  }
}

export async function searchInstructors(req, res, next) {
  try {
    const { error, value } = searchSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ message: 'Invalid query' });
    }

    const filter = {};
    if (value.name) filter.name = value.name;
    if (value.department) filter.department = value.department;

    const instructors = await Instructor.find(filter)
      .select('name department role')
      .lean();

    res.json({ count: instructors.length, instructors });
  } catch (err) {
    next(err);
  }
}