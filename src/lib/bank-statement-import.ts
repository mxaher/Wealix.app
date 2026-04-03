import type { ExpenseCategory, IncomeSource } from '@/store/useAppStore';

export type StatementAccountType = 'current' | 'credit_card';
export type StatementDirection = 'income' | 'expense';

export type StatementImportRow = {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  direction: StatementDirection;
  typeLabel: string;
  expenseCategory: ExpenseCategory;
  incomeSource: IncomeSource;
  merchantName: string | null;
  notes: string | null;
};

export type StatementImportPreview = {
  rows: StatementImportRow[];
  skippedRows: number;
  incomeCount: number;
  expenseCount: number;
  incomeTotal: number;
  expenseTotal: number;
  currency: string;
};

const MAX_STATEMENT_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_STATEMENT_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
]);
const DEFAULT_CURRENCY = 'SAR';

function hasZipSignature(bytes: Uint8Array) {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

function normalizeEasternArabicDigits(value: string) {
  return value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function normalizeHeader(value: string) {
  return normalizeEasternArabicDigits(value)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function assertStatementFile(file: File, bytes: Uint8Array) {
  if (file.size > MAX_STATEMENT_FILE_SIZE) {
    throw new Error('Statement file exceeds the 5MB upload limit.');
  }

  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv' || file.type === 'application/csv';
  const isXlsx = /\.xlsx$/i.test(file.name) || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  if (!ACCEPTED_STATEMENT_TYPES.has(file.type) && !isCsv && !isXlsx) {
    throw new Error('Only CSV and XLSX bank statement files are supported.');
  }

  if (isXlsx && !hasZipSignature(bytes)) {
    throw new Error('The uploaded spreadsheet does not match a valid XLSX file signature.');
  }
}

function splitCsvRow(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (char === delimiter && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

function detectCsvDelimiter(headerLine: string) {
  const commaCount = (headerLine.match(/,/g) || []).length;
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

async function parseCsvRows(bytes: Uint8Array) {
  const text = new TextDecoder().decode(bytes);
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('The statement CSV file does not contain enough rows to import.');
  }

  const delimiter = detectCsvDelimiter(lines[0]);
  const headers = splitCsvRow(lines[0], delimiter);

  return lines.slice(1).map((line) => {
    const values = splitCsvRow(line, delimiter);
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });
}

async function parseXlsxRows(buffer: ArrayBuffer, fileName: string) {
  if (/\.xlsm$/i.test(fileName)) {
    throw new Error('This spreadsheet contains macros and cannot be imported.');
  }

  const { Workbook } = await import('exceljs');
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    throw new Error('The spreadsheet file contains no data.');
  }

  let sheetHasFormulas = false;
  sheet.eachRow((row) => {
    row.eachCell((cell) => {
      if (typeof cell.value === 'object' && cell.value !== null && 'formula' in cell.value) {
        sheetHasFormulas = true;
      }
    });
  });

  if (sheetHasFormulas) {
    throw new Error('Remove spreadsheet formulas before importing this statement.');
  }

  const headerRow = sheet.getRow(1);
  const headerValues = (headerRow.values as Array<string | undefined | null>).slice(1);

  return sheet.getRows(2, sheet.rowCount - 1)?.map((row) => {
    const output: Record<string, unknown> = {};
    headerValues.forEach((header, index) => {
      if (!header) {
        return;
      }

      const cellValue = row.getCell(index + 1).value;
      output[String(header)] =
        typeof cellValue === 'object' && cellValue !== null && 'result' in cellValue
          ? (cellValue as { result: unknown }).result ?? ''
          : cellValue ?? '';
    });
    return output;
  }).filter(Boolean) ?? [];
}

function getFieldValue(row: Record<string, unknown>, aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeHeader));
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(normalizeHeader(key))) {
      return value;
    }
  }

  return undefined;
}

function parseAmount(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const normalized = normalizeEasternArabicDigits(String(value ?? ''))
    .replace(/[()]/g, (match) => (match === '(' ? '-' : ''))
    .replace(/[^\d.,-]/g, '')
    .replace(/,(?=\d{3}\b)/g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function excelSerialToDate(serial: number) {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
}

function parseDateValue(value: unknown) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === 'number' && Number.isFinite(value) && value > 20000 && value < 80000) {
    return excelSerialToDate(value).toISOString().slice(0, 10);
  }

  const normalized = normalizeEasternArabicDigits(String(value ?? '')).trim();
  if (!normalized) {
    return '';
  }

  const isoLike = normalized.match(/^(\d{4})[\/.\-](\d{1,2})[\/.\-](\d{1,2})$/);
  if (isoLike) {
    const [, year, month, day] = isoLike;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const common = normalized.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/);
  if (common) {
    const [, day, month, yearRaw] = common;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
}

function formatTypeLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function inferExpenseCategory(typeText: string, descriptionText: string): ExpenseCategory {
  const text = `${typeText} ${descriptionText}`.toLowerCase();

  if (/(food|restaurant|grocery|market|cafe|coffee|supermarket|مطعم|بقال)/.test(text)) return 'Food';
  if (/(uber|taxi|fuel|petrol|gas|transport|metro|bus|parking|سفر|وقود|نقل)/.test(text)) return 'Transport';
  if (/(utility|electric|water|internet|mobile|telecom|فاتورة|كهرباء|ماء|انترنت)/.test(text)) return 'Utilities';
  if (/(movie|cinema|game|entertain|netflix|spotify|fun|ترفيه)/.test(text)) return 'Entertainment';
  if (/(hospital|clinic|medical|health|pharmacy|insurance|صحة|صيدلية)/.test(text)) return 'Healthcare';
  if (/(school|course|training|tuition|education|جامعة|تعليم)/.test(text)) return 'Education';
  if (/(mall|amazon|noon|shopping|retail|store|متجر|تسوق)/.test(text)) return 'Shopping';
  if (/(rent|lease|housing|mortgage|apartment|villa|سكن|إيجار|عقار)/.test(text)) return 'Housing';

  return 'Other';
}

function inferIncomeSource(typeText: string, descriptionText: string): IncomeSource {
  const text = `${typeText} ${descriptionText}`.toLowerCase();

  if (/(salary|payroll|wage|راتب)/.test(text)) return 'salary';
  if (/(freelance|contract|consult|client|عمل حر)/.test(text)) return 'freelance';
  if (/(business|merchant settlement|sales|invoice|business income|مبيعات)/.test(text)) return 'business';
  if (/(dividend|interest|investment|coupon|cashback|rebate|استثمار|أرباح)/.test(text)) return 'investment';
  if (/(rent|rental|lease|tenant|إيجار)/.test(text)) return 'rental';

  return 'other';
}

function inferMerchantName(description: string) {
  const cleaned = description.split(/[|/\\-]/)[0]?.trim() ?? '';
  if (!cleaned) {
    return null;
  }

  return cleaned.slice(0, 80);
}

function looksLikeInternalTransfer(descriptionText: string) {
  return /(payment received|card payment|payment thank you|auto[-\s]?pay|internal transfer|own account|balance transfer|سداد|تحويل داخلي)/i.test(descriptionText);
}

function resolveTransactionDirection({
  accountType,
  amount,
  debit,
  credit,
  description,
  typeText,
}: {
  accountType: StatementAccountType;
  amount: number;
  debit: number;
  credit: number;
  description: string;
  typeText: string;
}) {
  const context = `${description} ${typeText}`.toLowerCase();

  if (looksLikeInternalTransfer(context)) {
    return 'skip' as const;
  }

  if (credit > 0 && debit <= 0) {
    if (accountType === 'credit_card' && /(refund|reversal|cashback|credit)/.test(context)) {
      return 'income' as const;
    }

    return accountType === 'credit_card' ? 'skip' as const : 'income' as const;
  }

  if (debit > 0 && credit <= 0) {
    return 'expense' as const;
  }

  if (accountType === 'credit_card') {
    if (/(refund|reversal|cashback)/.test(context)) {
      return 'income' as const;
    }

    return amount >= 0 ? 'expense' as const : 'income' as const;
  }

  return amount >= 0 ? 'income' as const : 'expense' as const;
}

function validateStatementColumns(rows: Record<string, unknown>[]) {
  const headerKeys = rows[0] ? Object.keys(rows[0]) : [];
  const normalizedHeaders = new Set(headerKeys.map(normalizeHeader));

  const hasDate = ['date', 'transactiondate', 'postingdate', 'valuedate', 'bookeddate'].some((key) => normalizedHeaders.has(key));
  const hasDescription = ['description', 'details', 'transactiondescription', 'narration', 'memo', 'merchant', 'reference'].some((key) => normalizedHeaders.has(key));
  const hasAmount = ['amount', 'transactionamount', 'amt', 'value', 'netamount', 'total'].some((key) => normalizedHeaders.has(key));
  const hasDebitCredit =
    ['debit', 'withdrawal', 'outflow', 'moneyout', 'dr', 'debitamount'].some((key) => normalizedHeaders.has(key)) &&
    ['credit', 'deposit', 'inflow', 'moneyin', 'cr', 'creditamount'].some((key) => normalizedHeaders.has(key));

  if (!hasDate || !hasDescription || (!hasAmount && !hasDebitCredit)) {
    throw new Error('The statement must include date, description, and either amount or debit/credit columns.');
  }
}

export async function buildStatementImportPreview(file: File, accountType: StatementAccountType): Promise<StatementImportPreview> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  assertStatementFile(file, bytes);

  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv' || file.type === 'application/csv';
  const rows = isCsv ? await parseCsvRows(bytes) : await parseXlsxRows(buffer, file.name);

  if (rows.length === 0) {
    throw new Error('No statement rows were found in the uploaded file.');
  }

  validateStatementColumns(rows);

  let skippedRows = 0;
  let incomeCount = 0;
  let expenseCount = 0;
  let incomeTotal = 0;
  let expenseTotal = 0;

  const previewRows = rows.flatMap((row, index) => {
    const date = parseDateValue(
      getFieldValue(row, ['Date', 'Transaction Date', 'Posting Date', 'Value Date', 'Booked Date'])
    );
    const description = String(
      getFieldValue(row, ['Description', 'Details', 'Transaction Description', 'Narration', 'Memo', 'Merchant', 'Reference']) ?? ''
    ).trim();
    const currency = String(getFieldValue(row, ['Currency', 'Curr', 'CCY']) ?? DEFAULT_CURRENCY).trim().toUpperCase() || DEFAULT_CURRENCY;
    const rawType = String(getFieldValue(row, ['Type', 'Category', 'Transaction Type', 'Classification']) ?? '').trim();
    const amountValue = parseAmount(getFieldValue(row, ['Amount', 'Transaction Amount', 'Amt', 'Value', 'Net Amount', 'Total']));
    const debit = Math.abs(parseAmount(getFieldValue(row, ['Debit', 'Withdrawal', 'Outflow', 'Money Out', 'DR', 'Debit Amount'])));
    const credit = Math.abs(parseAmount(getFieldValue(row, ['Credit', 'Deposit', 'Inflow', 'Money In', 'CR', 'Credit Amount'])));
    const absoluteAmount = debit > 0 || credit > 0 ? Math.max(debit, credit) : Math.abs(amountValue);

    if (!date || !description || absoluteAmount <= 0) {
      skippedRows += 1;
      return [];
    }

    const direction = resolveTransactionDirection({
      accountType,
      amount: amountValue,
      debit,
      credit,
      description,
      typeText: rawType,
    });

    if (direction === 'skip') {
      skippedRows += 1;
      return [];
    }

    const expenseCategory = inferExpenseCategory(rawType, description);
    const incomeSource = inferIncomeSource(rawType, description);
    const typeLabel = rawType
      ? formatTypeLabel(rawType)
      : direction === 'income'
        ? formatTypeLabel(incomeSource)
        : formatTypeLabel(expenseCategory);

    if (direction === 'income') {
      incomeCount += 1;
      incomeTotal += absoluteAmount;
    } else {
      expenseCount += 1;
      expenseTotal += absoluteAmount;
    }

    return [{
      id: `statement-row-${index + 1}`,
      date,
      description,
      amount: absoluteAmount,
      currency,
      direction,
      typeLabel,
      expenseCategory,
      incomeSource,
      merchantName: inferMerchantName(description),
      notes: rawType ? `Statement type: ${rawType}` : null,
    }] satisfies StatementImportRow[];
  });

  if (previewRows.length === 0) {
    throw new Error('No valid transactions could be extracted from this statement.');
  }

  const dominantCurrency = previewRows[0]?.currency ?? DEFAULT_CURRENCY;

  return {
    rows: previewRows.sort((left, right) => right.date.localeCompare(left.date)),
    skippedRows,
    incomeCount,
    expenseCount,
    incomeTotal,
    expenseTotal,
    currency: dominantCurrency,
  };
}
