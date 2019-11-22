import { User as dbUser } from '../sequelize/models';
const DEFAULT_USER = {
  first_name: "Default",
  last_name: "User",
  email: "default@example.com",
}


export default class User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  constructor(params) {
    ["id", "firstName", "lastName", "email"].forEach(key => {
      this[key] = params[key] || null;
    });
  }

  static async create(params) {
    const { firstName, lastName, email } = params;
    if(!email){
      throw new Error('No email passed in');
    }

    const user = await dbUser.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
    });

    return new User({
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    });
  }

  static async loginAsDefault(){
    const users = await dbUser.findAll({ where: { email: DEFAULT_USER.email }});
    let user = users[0];

    if(!user){
      user = await dbUser.create(DEFAULT_USER);
    }

    const userJSON = await user.toJSON();

    return new User({
      id: userJSON.id,
      firstName: userJSON.first_name,
      lastName: userJSON.last_name,
      email: userJSON.email,
    });
  }
}