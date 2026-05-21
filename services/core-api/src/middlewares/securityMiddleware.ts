import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes input string to prevent XML External Entity (XXE) injection,
 * XML injection, and HTML/XSS script injections.
 */
export function sanitizeString(val: string): string {
  let clean = val;

  // 1. Block XML declarations & DTD definitions (XXE Prevention)
  clean = clean.replace(/<\?xml[^>]*\?>/gi, '');
  clean = clean.replace(/<!DOCTYPE[^>]*>/gi, '');
  clean = clean.replace(/<!ENTITY[^>]*>/gi, '');
  clean = clean.replace(/<!ELEMENT[^>]*>/gi, '');
  clean = clean.replace(/<!ATTLIST[^>]*>/gi, '');
  clean = clean.replace(/SYSTEM\s+['"][^'"]*['"]/gi, '');
  clean = clean.replace(/PUBLIC\s+['"][^'"]*['"]/gi, '');
  clean = clean.replace(/xmlns\s*=\s*['"][^'"]*['"]/gi, '');

  // 2. Block XSS Script/HTML Tags
  clean = clean.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  
  // Strip any inline HTML tags to prevent scripting context escape
  clean = clean.replace(/<\/?[a-z][a-z0-9]*[^>]*>/gi, '');

  // 3. Escape minimal XML/HTML special characters if still present
  clean = clean.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#x27;');

  return clean;
}

/**
 * Recursively scans and sanitizes request parameters/body elements.
 */
export function sanitizeObject(val: any): any {
  if (typeof val === 'string') {
    return sanitizeString(val);
  } else if (Array.isArray(val)) {
    return val.map(sanitizeObject);
  } else if (val !== null && typeof val === 'object') {
    const sanitized: any = {};
    for (const key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        sanitized[key] = sanitizeObject(val[key]);
      }
    }
    return sanitized;
  }
  return val;
}

/**
 * Express middleware to sanitize body, query and params
 */
export function securitySanitizer(req: Request, res: Response, next: NextFunction) {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
}
