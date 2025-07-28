import { FormDataType, FormErrors } from "./types";
import { createStore, reconcile } from "solid-js/store";

import { UseFormReturn } from "./types";
import { z } from "zod";

/**
 * Create a form controls and validation using Zod schema
 * 
 * Use `handleChange` with the same input name as the schema's property
 * @param {z.ZodObject} schema 
 * @returns {UseFormReturn}
 */
export function useForm<T extends z.ZodObject>(schema: T): UseFormReturn<T> {
    // Infer the shape and get the keys for initialization
    const formKeys = Object.keys(schema.shape) as (keyof FormDataType<T>)[];

    // Create the initial state with empty strings for all fields
    const initialFormState = Object.fromEntries(
        formKeys.map((key) => [key, ""])
    ) as FormDataType<T>;

    const [form, setForm] = createStore({...initialFormState});
    const [formErrors, setFormErrors] = createStore<FormErrors<T>>({});

    const handleChange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const { name, value } = target;

        // Check if the input name is a valid form key before setting the state
        if (name in schema.shape) {
            setForm(name as any, value as any);
        } else {
            console.error("Invalid input name:", name);
        }
    };

    const validate = (): boolean => {
        const result = schema.safeParse(form);
        setFormErrors(reconcile(initialFormState as FormErrors<T>));
        if (result.success) {
            return true;
        } else {
            setFormErrors(reconcile(initialFormState as FormErrors<T>));
            for (const issue of result.error.issues) {
                if(issue.path[0]) {
                    const key = issue.path[0] as keyof FormDataType<T>;
                    setFormErrors(key as any, issue.message as any);
                } else {
                    console.error("No path found for issue:", issue);
                }
            }
            return false;
        }
    };

    return {
        form,
        formErrors,
        setForm,
        setFormErrors,
        handleChange,
        validate,
    };
}
