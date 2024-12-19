import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashService {
    /**
     * Creates a hash for the given password with a unique salt.
     * @param password The password to hash.
     * @returns The hashed password.
     */
    public createHash(password: string): string {
        const salt = bcrypt.genSaltSync(10); // Adjust the salt rounds as needed
        return bcrypt.hashSync(password, salt);
    }

    /**
     * Compares a hash with a plain-text password.
     * @param hash The hashed password.
     * @param password The plain-text password to compare.
     * @returns True if the password matches the hash; otherwise, false.
     */
    public match(hash: string, password: string): boolean {
        return bcrypt.compareSync(password, hash);
    }
}
