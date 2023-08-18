import { createInterface } from 'readline';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { getConnectionManager } from 'typeorm';
import getConfig from './common/config/main.config';
import { SocialServiceList } from './socials/entities/social-channel.entity';
import { SocialSession } from './socials/entities/social-session.entity';

const { TELEGRAM_API_ID = '', TELEGRAM_API_HASH = '' } = process.env;

if (!TELEGRAM_API_ID) {
  throw new Error('TELEGRAM_API_ID is undefined.');
}

if (!TELEGRAM_API_HASH) {
  throw new Error('TELEGRAM_API_HASH is undefined.');
}

const readLine = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const input = async (question: string): Promise<string> => {
  return new Promise<string>((resolve) => {
    readLine.question(question, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * @description Create telegram client session for login without auth.
 * @example `yarn run create:telegram:session`
 */
const createTelegramClientSession = async () => {
  const {
    database: { type: _type, logging: _logging, ...database },
    socials: { telegram },
  } = getConfig();

  const connectionManager = getConnectionManager();

  const connection = connectionManager.create({
    type: 'postgres',
    ...database,
    entities: [SocialSession],
  });

  await connection.connect();

  const socialSessionRepository = connection.getRepository(SocialSession);

  const socialSession = await socialSessionRepository.findOne({
    where: { service: SocialServiceList.TELEGRAM },
  });

  if (socialSession) {
    await connection.close();

    console.log('Telegram session is exists.\nExit ...');

    process.exit(0);
  }

  const stringSession = new StringSession('');

  const client = new TelegramClient(
    stringSession,
    telegram.apiId,
    telegram.apiHash,
    {
      connectionRetries: 5,
    },
  );

  await client.start({
    phoneNumber: async () => await input('Please enter your number: '),
    phoneCode: async () => await input('Please enter the code you received: '),
    onError: (err) => console.error(err),
  });

  const currentSession = client.session.save() as unknown as string;

  await socialSessionRepository.insert({
    service: SocialServiceList.TELEGRAM,
    session: currentSession,
  });

  console.log('Session string: [%s]', currentSession);
  console.log('Session string was saved. Done.');

  await client.disconnect();

  await connection.close();

  process.exit(0);
};

createTelegramClientSession();
