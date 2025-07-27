import type { SetStoreFunction } from 'solid-js/store';
import z from 'zod';

// Infer the form data type from the Zod schema
export type FormDataType<T extends z.ZodObject> = z.infer<T>;

// Form errors will be a partial record mapping field names to error messages
export type FormErrors<T extends z.ZodObject> = Partial<Record<keyof FormDataType<T>, string>>;

export interface UseFormReturn<T extends z.ZodObject> {
    form: FormDataType<T>;
    formErrors: FormErrors<T>;
    setForm: SetStoreFunction<FormDataType<T>>;
    setFormErrors: SetStoreFunction<FormErrors<T>>;
    handleChange: (e: Event) => void;
    validate: () => boolean;
}