import IMessage from './IMessage';

export default interface IUser {
  userID: string;
  username: string;
  messages: IMessage[];
  hasNewMessages: boolean;
  self: boolean;
  connected: boolean;
}
