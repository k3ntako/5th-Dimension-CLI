import { User as dbUser } from '../sequelize/models';


export default class User {
  constructor() {
  }

  static async create(params) {
    const { firstName, lastName, email } = params;

    const user = await dbUser.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
    });

    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
    };

  }
}