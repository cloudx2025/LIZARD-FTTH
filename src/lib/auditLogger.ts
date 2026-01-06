import { supabase } from './supabase';

export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE';

interface LogAuditParams {
  userId: string | undefined;
  userEmail: string | undefined;
  action: AuditAction;
  tableName: string;
  recordId: string;
  recordName?: string;
  oldData?: any;
  newData?: any;
}

export async function logAudit({
  userId,
  userEmail,
  action,
  tableName,
  recordId,
  recordName = '',
  oldData,
  newData
}: LogAuditParams) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId || null,
      user_email: userEmail || 'sistema',
      action,
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      old_data: oldData || null,
      new_data: newData || null
    });
  } catch (error) {
    console.error('Erro ao registrar log de auditoria:', error);
  }
}

export async function logInsert(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  data: any
) {
  await logAudit({
    userId,
    userEmail,
    action: 'INSERT',
    tableName,
    recordId,
    recordName,
    newData: data
  });
}

export async function logUpdate(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  oldData: any,
  newData: any
) {
  await logAudit({
    userId,
    userEmail,
    action: 'UPDATE',
    tableName,
    recordId,
    recordName,
    oldData,
    newData
  });
}

export async function logDelete(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  data: any
) {
  await logAudit({
    userId,
    userEmail,
    action: 'DELETE',
    tableName,
    recordId,
    recordName,
    oldData: data
  });
}
