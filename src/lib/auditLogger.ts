import { supabase } from './supabase';

export async function logInsert(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  newData: any
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail || 'unknown',
      action: 'INSERT',
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      new_data: newData,
    });
  } catch (error) {
    console.error('Erro ao registrar log de inserção:', error);
  }
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
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail || 'unknown',
      action: 'UPDATE',
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      old_data: oldData,
      new_data: newData,
    });
  } catch (error) {
    console.error('Erro ao registrar log de atualização:', error);
  }
}

export async function logDelete(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  oldData: any
) {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail || 'unknown',
      action: 'DELETE',
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      old_data: oldData,
    });
  } catch (error) {
    console.error('Erro ao registrar log de exclusão:', error);
  }
}
