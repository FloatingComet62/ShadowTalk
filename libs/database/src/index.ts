import { Connection } from './connection';
import { bindConnection as userBind } from './tables/user';
import { bindConnection as tokenBind } from './tables/token';
import { Logger } from '@shadowtalk/logging';

const connection = new Connection();
const logger = Logger(['database']);

export default {
  user: userBind(connection, logger.addWorkspace('user')),
  token: tokenBind(connection, logger.addWorkspace('token')),
}