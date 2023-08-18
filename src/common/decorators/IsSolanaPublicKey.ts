import { registerDecorator, ValidationOptions } from 'class-validator';
import { PublicKey } from '@solana/web3.js';

export function IsSolanaPublicKey(validationOptions?: ValidationOptions) {
  return function (object, propertyName: string) {
    registerDecorator({
      name: 'IsSolanaPublicKey',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: `${propertyName} must be an Solana public key`,
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          try {
            new PublicKey(String(value));
          } catch (e) {
            return false;
          }

          return true;
        },
      },
    });
  };
}
