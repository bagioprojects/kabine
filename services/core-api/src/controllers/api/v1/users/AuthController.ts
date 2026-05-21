import { Request, Response } from 'express';
import { AuthService } from '../../../../services/users/AuthService';

export class AuthController {
  
  // POST /api/v1/users/register
  public static async register(req: Request, res: Response) {
    try {
      const { username, phoneNumber, characterName, characterSurname, password } = req.body;

      const trimmedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
      const trimmedPhone = typeof phoneNumber === 'string' ? phoneNumber.trim() : '';
      const trimmedCharName = typeof characterName === 'string' ? characterName.trim() : '';
      const trimmedCharSurname = typeof characterSurname === 'string' ? characterSurname.trim() : '';
      const rawPassword = typeof password === 'string' ? password : '';

      if (!trimmedUsername || !trimmedPhone || !rawPassword || !trimmedCharName || !trimmedCharSurname) {
        return res.status(400).json({ success: false, message: 'Tüm kimlik alanlarının doldurulması zorunludur.' });
      }

      // 1. Username validation: 3-20 characters, lowercase alphanumeric, underscores, hyphens
      const usernameRegex = /^[a-z0-9_-]{3,20}$/;
      if (!usernameRegex.test(trimmedUsername)) {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve yalnızca küçük harf, rakam, alt çizgi (_) veya tire (-) içermelidir.'
        });
      }

      if (trimmedUsername === 'yalova') {
        return res.status(400).json({
          success: false,
          message: 'Kullanıcı adı "yalova" olamaz.'
        });
      }

      // 2. Character Name & Surname validation: letters and spaces only, 2-30 characters
      const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]{2,30}$/;
      if (!nameRegex.test(trimmedCharName) || !nameRegex.test(trimmedCharSurname)) {
        return res.status(400).json({
          success: false,
          message: 'Karakter adı ve soyadı yalnızca harflerden oluşmalı ve en az 2 karakter olmalıdır.'
        });
      }

      // 3. Password strength check: minimum 6 characters
      if (rawPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Şifreniz en az 6 karakter uzunluğunda olmalıdır.'
        });
      }

      // 4. Phone number validation: Must be exactly +90 followed by 10 digits (e.g. +905321234567)
      const phoneRegex = /^\+90\d{10}$/;
      if (!phoneRegex.test(trimmedPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Lütfen geçerli bir telefon numarası giriniz (+90 sabit ve en fazla/tam olarak 10 hane olmalıdır).'
        });
      }
      const normalizedPhone = trimmedPhone.replace(/\D/g, '');

      // Map raw request to user payload
      const payload = {
        username: trimmedUsername,
        phoneNumber: normalizedPhone,
        characterName: trimmedCharName,
        characterSurname: trimmedCharSurname,
        passwordHash: rawPassword // It will be hashed in the service
      };

      const result = await AuthService.registerUser(payload as any);

      res.status(201).json({
        success: true,
        message: 'Welcome to the Republic!',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // POST /api/v1/users/login
  public static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      const trimmedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
      const rawPassword = typeof password === 'string' ? password : '';

      if (!trimmedUsername || !rawPassword) {
        return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre gereklidir.' });
      }

      const result = await AuthService.loginUser(trimmedUsername, rawPassword);

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  }
}
