// Interfaz o contrato que deben cumplir todos los que quieran.
import ISession from '../interfaces/ISession';

interface SessionStore {
  /**
   * Encuetra la sesión dado el id de la misma
   * @param id ID Sesion
   */
  findSession(id: string): any ;

  /**
   * Salva una sesión en almacenamiento
   * @param id ID Sesión
   * @param session Sesión
   */
  saveSession(id: string, session: ISession): any;

  /**
   * Obtiene las sesiones existentes
   */
  findAllSessions(): any;
}

export default SessionStore;
