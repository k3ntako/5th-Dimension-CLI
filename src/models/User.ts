import db from '../sequelize/models';
const DEFAULT_USER = {
  first_name: "Default",
  last_name: "User",
  email: "default@example.com",
}


export default class User {
  constructor(params) {}

  static async create(params) {
    const { firstName, lastName, email } = params;
    if(!email){
      throw new Error('No email passed in');
    }

    const user = await db.User.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
    });

    return user;
  }

  static async loginAsDefault(){
    const users = await db.User.findAll({ where: { email: DEFAULT_USER.email }});
    let user = users[0];

    if(!user){
      user = await db.User.create(DEFAULT_USER);
    }

    return user;
  }
}