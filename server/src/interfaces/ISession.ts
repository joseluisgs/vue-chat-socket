import IMessage from './IMessage';

export default interface ISession {
  userID: string,
  username: string,
  connected: boolean,
  messages: IMessage[];
}
