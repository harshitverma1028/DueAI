import AuditLog from '../models/AuditLog.js';
export const audit=(data)=>AuditLog.create(data);
