import User from "./user.js";

export const getAllUsers = () => User.findAll();
export const createUser = (name, email) => User.create({ name, email });

export default User;