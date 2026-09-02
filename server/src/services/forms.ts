import fs from 'fs/promises';
import {
  PDFCheckBox,
  PDFDropdown,
  PDFOptionList,
  PDFRadioGroup,
  PDFTextField,
  StandardFonts
} from 'pdf-lib';
import { loadPdf, mapPdfError } from '../utils/pdf.js';
import { writeTemp } from '../utils/temp.js';

export type FormFieldInfo = {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'list';
  value: string | boolean;
  options?: string[];
};

function describeField(field: unknown): FormFieldInfo | null {
  if (field instanceof PDFTextField) {
    return { name: field.getName(), type: 'text', value: field.getText() ?? '' };
  }
  if (field instanceof PDFCheckBox) {
    return { name: field.getName(), type: 'checkbox', value: field.isChecked() };
  }
  if (field instanceof PDFDropdown) {
    return {
      name: field.getName(),
      type: 'dropdown',
      value: field.getSelected()[0] ?? '',
      options: field.getOptions()
    };
  }
  if (field instanceof PDFRadioGroup) {
    return {
      name: field.getName(),
      type: 'radio',
      value: field.getSelected() ?? '',
      options: field.getOptions()
    };
  }
  if (field instanceof PDFOptionList) {
    return {
      name: field.getName(),
      type: 'list',
      value: field.getSelected()[0] ?? '',
      options: field.getOptions()
    };
  }
  return null;
}

export async function inspectPdfForm(filePath: string): Promise<{ fields: FormFieldInfo[] }> {
  try {
    const pdf = await loadPdf(await fs.readFile(filePath));
    const fields = pdf.getForm().getFields().map(describeField).filter((field): field is FormFieldInfo => Boolean(field));
    if (fields.length === 0) {
      throw new Error('Ce PDF n’a pas de champs de formulaire à remplir.');
    }
    return { fields };
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de lire les champs de ce formulaire.'));
  }
}

export async function flattenPdfForm(filePath: string) {
  try {
    const pdf = await loadPdf(await fs.readFile(filePath));
    const form = pdf.getForm();
    if (form.getFields().length === 0) {
      throw new Error('Ce PDF n’a pas de formulaire à aplatir.');
    }
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
    form.flatten();
    return writeTemp(await pdf.save(), 'flatten', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible d’aplatir ce PDF.'));
  }
}

export async function fillPdfForm(
  filePath: string,
  rawValues: unknown,
  flatten: boolean
) {
  const values = rawValues && typeof rawValues === 'object' ? rawValues as Record<string, unknown> : {};
  try {
    const pdf = await loadPdf(await fs.readFile(filePath));
    const form = pdf.getForm();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    for (const field of form.getFields()) {
      const info = describeField(field);
      if (!info || !(info.name in values)) continue;
      const value = values[info.name];
      try {
        if (field instanceof PDFTextField) {
          field.setText(String(value ?? '').slice(0, 2000));
        } else if (field instanceof PDFCheckBox) {
          const on = value === true || value === 'true' || value === '1' || value === 'on';
          if (on) field.check();
          else field.uncheck();
        } else if (field instanceof PDFDropdown || field instanceof PDFOptionList || field instanceof PDFRadioGroup) {
          const selected = String(value ?? '');
          if (selected) field.select(selected);
        }
      } catch {
        /* skip a field that cannot take this value */
      }
    }

    form.updateFieldAppearances(font);
    if (flatten) form.flatten();
    return writeTemp(await pdf.save(), 'form', 'pdf');
  } catch (error) {
    throw new Error(mapPdfError(error, 'Impossible de remplir ce formulaire.'));
  }
}
