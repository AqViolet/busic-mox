'use server';

import { db } from '@/lib/db';
import crypto from 'crypto';


const md5 = (input: string) => crypto.createHash('md5').update(input).digest('hex');


export async function registerUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) throw new Error('All fields are required.');

  const hashedPassword = md5(password);

  try {
    await db.execute(
      'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      [username, hashedPassword]
    );
    return { success: true };
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('Username already exists.');
    }
    throw err;
  }
}


export async function loginUser(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) throw new Error('All fields are required.');

  const hashedPassword = md5(password);

  const [rows]: any = await db.execute(
    'SELECT * FROM users WHERE username = ? AND password_hash = ?',
    [username, hashedPassword]
  );

  if (rows.length === 0) throw new Error('Invalid username or password.');

  return { success: true, username };
}