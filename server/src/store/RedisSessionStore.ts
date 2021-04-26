import SessionStore from './SesionStore';
import ISession from '../interfaces/ISession';

/**
 * Clase que implementa el almacenamiento en Redis
 */

const SESSION_TTL = 24 * 60 * 60;
const mapSession = ([userID, username, connected]) => (userID ? { userID, username, connected: connected === 'true' } : undefined);

class RedisSessionStore implements SessionStore {
  private redisClient;

  constructor(redisClient: any) {
    this.redisClient = redisClient;
  }

  /**
   * Busca una sesión dado su ID
   * @param id id
   * @returns
   */
  findSession(id: string) {
    return this.redisClient
      .hmget(`session:${id}`, 'userID', 'username', 'connected')
      .then(mapSession);
  }

  /**
   * Salva una sesión
   * @param id ID
   * @param session Sesion
   */
  saveSession(id: string, session: ISession) {
    this.redisClient
      .multi()
      .hset(
        `session:${id}`,
        'userID',
        session.userID,
        'username',
        session.username,
        'connected',
        session.connected,
      )
      .expire(`session:${id}`, SESSION_TTL)
      .exec();
  }

  /**
   * Retorna todas las sesiones
   * @returns Sesiones
   */
  async findAllSessions() {
    const keys = new Set();
    let nextIndex = 0;
    do {
      // eslint-disable-next-line no-await-in-loop
      const [nextIndexAsStr, results] = await this.redisClient.scan(
        nextIndex,
        'MATCH',
        'session:*',
        'COUNT',
        '100',
      );
      nextIndex = parseInt(nextIndexAsStr, 10);
      results.forEach((s: any) => keys.add(s));
    } while (nextIndex !== 0);
    const commands: any[] = [];
    keys.forEach((key) => {
      commands.push(['hmget', key, 'userID', 'username', 'connected']);
    });
    return this.redisClient
      .multi(commands)
      .exec()
      .then((results: any) => results
        .map(([err, session]) => (err ? undefined : mapSession(session)))
        .filter((v: any) => !!v));
  }
}

export default RedisSessionStore;
