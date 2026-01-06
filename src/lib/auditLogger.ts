import { supabase } from './supabase';

export async function logInsert(
  userId: string | undefined,
  userEmail: string | undefined,
  tableName: string,
  recordId: string,
  recordName: string,
  newData: any
) {
  if (!userId || !userEmail) return;

  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail,
      action: 'INSERT',
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      old_data: null,
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
  if (!userId || !userEmail) return;

  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail,
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
  if (!userId || !userEmail) return;

  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      user_email: userEmail,
      action: 'DELETE',
      table_name: tableName,
      record_id: recordId,
      record_name: recordName,
      old_data: oldData,
      new_data: null,
    });
  } catch (error) {
    console.error('Erro ao registrar log de exclusão:', error);
  }
}
