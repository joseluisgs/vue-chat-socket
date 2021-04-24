import SessionStore from './SesionStore';
import ISession from '../interfaces/ISession';

/**
 * Clase que implementa el almacenamiento en memoria
 */
class InMemorySessionStore implements SessionStore {
  // Mapa para manejar las sesiones. Clave - Valor
  private sessions: Map<string, ISession>;

  constructor() {
    this.sessions = new Map();
  }

  /**
   * Busca una sesión dado su ID
   * @param id id
   * @returns
   */
  findSession(id: string): ISession | undefined {
    return this.sessions.get(id);
  }

  /**
   * Salva una sesión
   * @param id ID
   * @param session Sesion
   */
  saveSession(id: string, session: ISession): Map<string, ISession> {
    return this.sessions.set(id, session);
  }

  /**
   * Retorna todas las sesiones
   * @returns Sesiones
   */
  findAllSessions() {
    return [...this.sessions.values()];
  }
}

export default InMemorySessionStore;
