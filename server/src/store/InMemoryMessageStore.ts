import MessageStore from './MessageStore';
import IMessage from '../interfaces/IMessage';

class InMemoryMessageStore implements MessageStore {
  private messages: IMessage[];

  constructor() {
    this.messages = [];
  }

  /**
   * Salva un mensajes en almacenamiento
   * @param message Mensaje
   * @returns numero en la lista
   */
  saveMessage(message: IMessage) {
    return this.messages.push(message);
  }

  /**
   * Encuetra la lista de mensajes de un usuario
   * @param userID ID de usuario
   * @returns lista de mensajes
   */
  findMessagesForUser(userID: string) {
    return this.messages.filter(
      ({ from, to }) => from === userID || to === userID,
    );
  }
}

export default InMemoryMessageStore;
