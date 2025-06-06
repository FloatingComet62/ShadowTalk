import { Connection } from './connection';

const connection = new Connection();

import { bindConnection as userBind } from './tables/user';
export const user = userBind(connection);

import { bindConnection as tokenBind } from './tables/token';
export const token = tokenBind(connection);
