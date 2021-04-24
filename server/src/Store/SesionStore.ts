// Interfaz o contrato que deben cumplir todos los que quieran.
import ISession from '../interfaces/ISession';

interface SessionStore {
  findSession(id: string): ISession | undefined;

  saveSession(id: string, session: ISession): Map<string, ISession>;

  findAllSessions(): ISession[];
}

export default SessionStore;
