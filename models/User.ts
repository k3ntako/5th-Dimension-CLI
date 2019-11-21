import { IBook } from '../utilities/interfaces';
import { User as DBUser } from '../sequelize/models';


export default class User {
  constructor() {
  }

  static async create(params) {
    const { firstName, lastName, email } = params;

    const user = await DBUser.create({
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