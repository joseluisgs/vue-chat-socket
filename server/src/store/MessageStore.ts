import IMessage from '../interfaces/IMessage';

export default interface MessageStore {
  /**
   * Salva un mensaje en almacenamiento
   * @param message Mensajes
   */
  saveMessage(message: IMessage): any;

  /**
   * Obtiene todos los mensajes del usuario
   * @param userID ID de usuario
   */
  findMessagesForUser(userID: string): IMessage[];
}
