import MessageStore from './MessageStore';
import IMessage from '../interfaces/IMessage';

const CONVERSATION_TTL = 24 * 60 * 60;

class RedisMessageStore implements MessageStore {
  private redisClient;

  constructor(redisClient: any) {
    this.redisClient = redisClient;
  }

  /**
   * Salva un mensajes en almacenamiento
   * @param message Mensaje
   * @returns numero en la lista
   */
  saveMessage(message: IMessage) {
    const value = JSON.stringify(message);
    this.redisClient
      .multi()
      .rpush(`messages:${message.from}`, value)
      .rpush(`messages:${message.to}`, value)
      .expire(`messages:${message.from}`, CONVERSATION_TTL)
      .expire(`messages:${message.to}`, CONVERSATION_TTL)
      .exec();
  }

  /**
   * Encuetra la lista de mensajes de un usuario
   * @param userID ID de usuario
   * @returns lista de mensajes
   */
  findMessagesForUser(userID: string) {
    return this.redisClient
      .lrange(`messages:${userID}`, 0, -1)
      .then((results:any) => results.map((result:any) => JSON.parse(result)));
  }
}

export default RedisMessageStore;
