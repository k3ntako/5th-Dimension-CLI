// Local dependencies
import Book from '../Book';
import { User as IUser } from '../../sequelize/models/user';
import ReadingList from '../ReadingList';


export default class ViewListAction {
  constructor(){}

  static async start(user: IUser, readingListPage: number): Promise<Book[]>{
    return await ReadingList.getList(user, readingListPage);
  }
}
