import db from '../sequelize/models';
import { User as IUser } from '../sequelize/models/user';
const DEFAULT_USER: FD.UserParams = {
  first_name: "Default",
  last_name: "User",
  email: "default@example.com",
}


export default class User {
  constructor() {}

  static async create(params: FD.UserParams): Promise<IUser> {
    const { first_name, last_name, email } = params;
    if(!email){
      throw new Error('No email passed in');
    }

    const user = await db.User.create({
      first_name,
      last_name,
      email: email,
    });

    return user;
  }

  static async loginAsDefault(): Promise<IUser>{
    let user: IUser;
    await db.sequelize.transaction(async transaction => {
      const users: IUser[] = await db.User.findAll({
        where: { email: DEFAULT_USER.email },
        transaction,
        lock: true,
      });

      user = users[0];

      if(!user){
        user = await db.User.create(
          DEFAULT_USER,
          {
            transaction,
            lock: true,
          }
        );
      }
    });

    return user;
  }
}