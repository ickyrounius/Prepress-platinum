/**
 * fieldStandardization.ts
 * 
 * Centralized field naming standards and normalization utilities.
 * This file ensures consistent field names across all domain objects
 * and services, reducing bugs from field naming inconsistencies.
 */

/**
 * Primary canonical field names - these are the authoritative field names
 * that should be used for all new data being created or stored.
 */
export const CANONICAL_FIELDS = {
  // Workflow Status Fields
  JOP_WORKFLOW_STATUS: 'ST_WF_JOP',
  JOS_WORKFLOW_STATUS: 'ST_WF_JOS',
  
  // Dates
  JOP_MASUK_DATE: 'TGL_MASUK_JOP',
  JOS_MASUK_DATE: 'TGL_MASUK_JOS',
  TARGET_DATE: 'TGL_TARGET',
  JOP_DATE: 'TGL_JOP',
  JOS_DATE: 'TGL_JOS',
  
  // Names and Types
  JOP_NUMBER: 'NO_JOP',
  JOS_NUMBER: 'NO_JOS',
  JOP_TYPE: 'TIPE_JOP',
  JOS_TYPE: 'TIPE_JOS',
  JOP_NAME: 'NAMA_JOP',
  JOS_NAME: 'NAMA_JOS',
  
  // People
  PIC_MAIN: 'PIC_UTAMA',
  PIC_SUPPORT: 'PIC_SUPPORT',
  OPERATOR: 'OPERATOR',
  QC_USER: 'QC_USER',
  
  // Production Status
  PROD_STATUS: 'ST_PRO_JOP',
  
  // Update tracking
  LAST_UPDATED: 'LAST_UPDATED',
  LAST_UPDATED_BY: 'LAST_UPDATED_BY',
  
  // Company/Buyer Info
  BUYER: 'BUYER',
  ID: 'ID'
} as const;

/**
 * Field aliases mapping - used to normalize different naming conventions
 * Maps all possible variations to the canonical field name
 */
export const FIELD_ALIASES: Record<string, keyof typeof CANONICAL_FIELDS> = {
  // Workflow Status Aliases
  'ST_WF_JOP': 'JOP_WORKFLOW_STATUS',
  'ST_WORKFLOW': 'JOP_WORKFLOW_STATUS',
  'status_workflow': 'JOP_WORKFLOW_STATUS',
  'status_dt': 'JOP_WORKFLOW_STATUS',
  'workflow_status': 'JOP_WORKFLOW_STATUS',
  'st_jop': 'JOP_WORKFLOW_STATUS',
  
  'ST_WF_JOS': 'JOS_WORKFLOW_STATUS',
  'status_jos': 'JOS_WORKFLOW_STATUS',
  'status_dg': 'JOS_WORKFLOW_STATUS',
  'status_jos': 'JOS_WORKFLOW_STATUS',
  
  // Date Aliases
  'TGL_MASUK_JOP': 'JOP_MASUK_DATE',
  'tgl_masuk': 'JOP_MASUK_DATE',
  'tgl_masuk_jop': 'JOP_MASUK_DATE',
  'tanggal_masuk': 'JOP_MASUK_DATE',
  'DATE_IN': 'JOP_MASUK_DATE',
  
  'TGL_MASUK_JOS': 'JOS_MASUK_DATE',
  'TGL_MASUK': 'JOS_MASUK_DATE', // Could be either, context determines
  
  'TGL_TARGET': 'TARGET_DATE',
  'tgl_target': 'TARGET_DATE',
  'target_date': 'TARGET_DATE',
  'TGL_TARGET_JOP': 'TARGET_DATE',
  'TGL_TARGET_JOS': 'TARGET_DATE',
  
  'TGL_JOP': 'JOP_DATE',
  'tgl_jop': 'JOP_DATE',
  'TGL_JOS': 'JOS_DATE',
  'tgl_jos': 'JOS_DATE',
  
  // Name/Number Aliases
  'NO_JOP': 'JOP_NUMBER',
  'no_jop': 'JOP_NUMBER',
  'JOP_NO': 'JOP_NUMBER',
  'jop_no': 'JOP_NUMBER',
  'JOP_ID': 'JOP_NUMBER',
  'jop_id': 'JOP_NUMBER',
  
  'NO_JOS': 'JOS_NUMBER',
  'no_jos': 'JOS_NUMBER',
  'JOS_NO': 'JOS_NUMBER',
  'jos_no': 'JOS_NUMBER',
  'JOS_ID': 'JOS_NUMBER',
  'jos_id': 'JOS_NUMBER',
  'id_jos': 'JOS_NUMBER',
  
  'TIPE_JOP': 'JOP_TYPE',
  'tipe_jop': 'JOP_TYPE',
  'JOP_TYPE': 'JOP_TYPE',
  'jop_type': 'JOP_TYPE',
  'TIPE_JOP': 'JOP_TYPE',
  
  'TIPE_JOS': 'JOS_TYPE',
  'tipe_jos': 'JOS_TYPE',
  'JOS_TYPE': 'JOS_TYPE',
  'jos_type': 'JOS_TYPE',
  
  'NAMA_JOP': 'JOP_NAME',
  'nama_jop': 'JOP_NAME',
  'JOP_NAME': 'JOP_NAME',
  'jop_name': 'JOP_NAME',
  
  'NAMA_JOS': 'JOS_NAME',
  'nama_jos': 'JOS_NAME',
  'JOS_NAME': 'JOS_NAME',
  'jos_name': 'JOS_NAME',
  
  // People Aliases
  'PIC_UTAMA': 'PIC_MAIN',
  'pic_utama': 'PIC_MAIN',
  'PIC_MAIN': 'PIC_MAIN',
  'pic_main': 'PIC_MAIN',
  'MAIN_PIC': 'PIC_MAIN',
  'pic_utama_jop': 'PIC_MAIN',
  
  'PIC_SUPPORT': 'PIC_SUPPORT',
  'pic_support': 'PIC_SUPPORT',
  'PIC_SUPPORTING': 'PIC_SUPPORT',
  'SUPPORT_PIC': 'PIC_SUPPORT',
  
  'OPERATOR': 'OPERATOR',
  'operator': 'OPERATOR',
  'operator_id': 'OPERATOR',
  'OPERATOR_ID': 'OPERATOR',
  
  'QC_USER': 'QC_USER',
  'qc_user': 'QC_USER',
  'QC_OPERATOR': 'QC_USER',
  'qc_operator': 'QC_USER',
  
  // Production Status Aliases
  'ST_PRO_JOP': 'PROD_STATUS',
  'st_pro_jop': 'PROD_STATUS',
  'status_pro_jop': 'PROD_STATUS',
  'ST_PRO_JOS': 'PROD_STATUS',
  'ST_PRO_NO_B': 'PROD_STATUS',
  'production_status': 'PROD_STATUS',
  'prod_status': 'PROD_STATUS',
  
  // Update tracking Aliases
  'LAST_UPDATED': 'LAST_UPDATED',
  'last_updated': 'LAST_UPDATED',
  'updated_at': 'LAST_UPDATED',
  'UPDATED_AT': 'LAST_UPDATED',
  'timestamp': 'LAST_UPDATED',
  'TIMESTAMP': 'LAST_UPDATED',
  
  'LAST_UPDATED_BY': 'LAST_UPDATED_BY',
  'last_updated_by': 'LAST_UPDATED_BY',
  'updated_by': 'LAST_UPDATED_BY',
  'UPDATED_BY': 'LAST_UPDATED_BY',
  
  // Company/Buyer Aliases
  'BUYER': 'BUYER',
  'buyer': 'BUYER',
  'BUYER_NAME': 'BUYER',
  'buyer_name': 'BUYER',
  'COMPANY': 'BUYER',
  'company': 'BUYER',
  
  'ID': 'ID',
  'id': 'ID',
  'ID_JOP': 'ID',
  'id_jop': 'ID',
  'ID_JOS': 'ID',
  'id_jos': 'ID'
} as const;

/**
 * Get the canonical field name for any field alias
 * @param fieldName The field name to standardize (any variation)
 * @returns The canonical field name constant
 * @example getCanonicalFieldName('status_workflow') → CANONICAL_FIELDS.JOP_WORKFLOW_STATUS
 */
export function getCanonicalFieldName(fieldName: string): string {
  const normalized = fieldName.trim().toUpperCase();
  const aliasKey = FIELD_ALIASES[normalized];
  
  if (aliasKey) {
    return CANONICAL_FIELDS[aliasKey] as string;
  }
  
  // If not found in aliases, try case-insensitive direct lookup in canonical fields
  for (const [key, value] of Object.entries(CANONICAL_FIELDS)) {
    if (value.toUpperCase() === normalized) {
      return value;
    }
  }
  
  // Fallback: return the original field name if not recognized
  console.warn(`Field "${fieldName}" not in standardization map. Using as-is.`);
  return fieldName;
}

/**
 * Get value from object using any field name variation
 * @param obj The object to search
 * @param fieldAlias Any variation of the field name
 * @returns The value if found, otherwise undefined
 * @example getValue({ status_workflow: 'REVIEW' }, 'ST_WF_JOP') → 'REVIEW'
 */
export function getFieldValue(obj: Record<string, any>, fieldAlias: string): any {
  if (!obj) return undefined;
  
  // Try direct key first
  if (fieldAlias in obj) {
    return obj[fieldAlias];
  }
  
  // Try exact canonical field
  const canonical = CANONICAL_FIELDS[getCanonicalFieldName(fieldAlias) as keyof typeof CANONICAL_FIELDS];
  if (canonical in obj) {
    return obj[canonical];
  }
  
  // Try all possible aliases for this canonical name
  const targetCanonical = FIELD_ALIASES[fieldAlias.toUpperCase()];
  if (targetCanonical) {
    const canonicalValue = CANONICAL_FIELDS[targetCanonical];
    if (canonicalValue in obj) {
      return obj[canonicalValue];
    }
  }
  
  // Try all keys in aliases to find which canonical this might be
  for (const [alias, canonicalKey] of Object.entries(FIELD_ALIASES)) {
    if (alias.toUpperCase() === fieldAlias.toUpperCase()) {
      const canonicalName = CANONICAL_FIELDS[canonicalKey];
      if (canonicalName in obj) {
        return obj[canonicalName];
      }
    }
  }
  
  return undefined;
}

/**
 * Set value in object using canonical field name, removing old aliases
 * @param obj The object to update
 * @param fieldName Field name (any variation)
 * @param value The value to set
 * @returns Updated object
 * @example setFieldValue({ status_workflow: 'OLD' }, 'ST_WF_JOP', 'NEW') → { ST_WF_JOP: 'NEW' }
 */
export function setFieldValue(
  obj: Record<string, any>,
  fieldName: string,
  value: any
): Record<string, any> {
  const canonical = getCanonicalFieldName(fieldName);
  
  // Remove all known aliases for this field
  const targetCanonical = FIELD_ALIASES[fieldName.toUpperCase()];
  if (targetCanonical) {
    const canonicalValue = CANONICAL_FIELDS[targetCanonical];
    for (const [alias, aliasCanonical] of Object.entries(FIELD_ALIASES)) {
      if (aliasCanonical === targetCanonical && alias in obj) {
        delete obj[alias];
      }
    }
  }
  
  // Set the canonical field
  obj[canonical] = value;
  return obj;
}

/**
 * Normalize all field names in an object to canonical names
 * @param obj The object to normalize
 * @returns New object with all fields renamed to canonical names
 */
export function normalizeFieldNames(obj: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const canonical = getCanonicalFieldName(key);
    // Avoid overwriting if the key already maps to same canonical
    if (!(canonical in normalized)) {
      normalized[canonical] = value;
    }
  }
  
  return normalized;
}
