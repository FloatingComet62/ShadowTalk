import { Connection } from './connection';
import { Logger } from '@shadowtalk/logging';
import { ConnectionInterface, ConnectionInterfaceMethods } from './types';
export { Token, User, ConnectionInterface } from './types';

const connection = new Connection();
const logger = Logger(['database']);

// Create wrapper functions using a for loop
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const dbFunctions: Record<string, Function> = {};

for (const method of ConnectionInterfaceMethods) {
  dbFunctions[method.name] = (...args: any[]) => {
    const kwargs: Record<string, any> = {};
    method.args.forEach((argName, index) => {
      if (index < args.length) {
        kwargs[argName] = args[index];
      }
    });

    logger.info(`${method.name} | args: `, kwargs);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    return (connection[method.name] as Function).apply(connection, args);
  };
}

export default dbFunctions as unknown as ConnectionInterface;
