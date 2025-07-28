# solidjs-hook-form

[![npm version](https://img.shields.io/npm/v/solidjs-hook-form.svg)](https://www.npmjs.com/package/solidjs-hook-form)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Performant, flexible and extensible forms with easy-to-use validation for SolidJS, powered by Zod.

## Features

-   **Built for SolidJS:** Leverages Solid's reactivity system for optimal performance and minimal re-renders.
-   **Simple API:** Get started quickly with a minimal and intuitive hook-based API.
-   **Powerful Validation:** Uses Zod for schema validation, allowing for complex, type-safe validation rules, including cross-field validation.
-   **Lightweight & Unstyled:** No unnecessary dependencies and no built-in styles, giving you full control over the look and feel.

## Installation

Install the package and its peer dependencies:

```bash
npm install solidjs-hook-form
```

Also this package requires [Zod](https://github.com/colinhacks/zod) and [SolidJS](https://www.npmjs.com/package/solid-js) to be installed.

```bash
npm install zod solid-js
```

## API Reference

The `useForm` hook is the core of this library. It takes a Zod schema and returns an object with everything you need to manage your form.

### `useForm(schema)`

#### Parameters

-   `schema`: A Zod schema object (e.g., `z.object({...})`) that defines the shape and validation rules for your form.

#### Return Value

The hook returns a reactive object with the following properties:

-   `form`: A Solid store containing the live state of your form fields. You can bind its values directly to your inputs.
-   `formErrors`: A Solid store that holds any validation errors. The keys correspond to the field names in your schema. If a field is valid or hasn't been validated yet, its entry will be empty.
-   `handleChange`: An event handler to be passed to the `onInput` or `onChange` prop of your form inputs. It automatically updates the `form` store based on the input's `name` attribute.
-   `validate`: A function that validates the current form data against the Zod schema. It populates the `formErrors` store with any validation messages and returns `true` if the form is valid, or `false` otherwise.
-   `setForm`: A function to programmatically set the value of one or more fields in the form state.
-   `setFormErrors`: A function to programmatically set error messages.

## Usage Example

Here is a complete example of a registration form that demonstrates key features like password confirmation and displaying validation errors.

```tsx
import { useForm } from 'solidjs-hook-form';
import { z } from 'zod';

// 1. Define your validation schema with Zod.
// You can include complex rules and cross-field validation.
const registerSchema = z.object({
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string()
}).superRefine(({ password, confirmPassword }, ctx) => {
    // Example of cross-field validation
    if (password !== confirmPassword) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords do not match",
            path: ["confirmPassword"] // Path to the field that should display the error
        });
    }
});

export default function RegisterForm() {
    // 2. Initialize the form with your schema.
    const { form, formErrors, handleChange, validate } = useForm(registerSchema);

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        
        // 3. Validate the form on submission.
        if (validate()) {
            console.log("Form is valid! Submitting data:", form);
            // Proceed with your API call or other logic
        } else {
            console.log("Form is invalid. Please check the errors.");
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem', maxWidth: '400px' }}>
            <div style={{ display: 'grid', gap: '0.25rem' }}>
                <label for="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onInput={handleChange}
                    style={formErrors.email ? { border: '1px solid red' } : {}}
                />
                {formErrors.email && <p style={{ color: 'red', margin: 0 }}>{formErrors.email}</p>}
            </div>

            <div style={{ display: 'grid', gap: '0.25rem' }}>
                <label for="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onInput={handleChange}
                    style={formErrors.password ? { border: '1px solid red' } : {}}
                />
                {formErrors.password && <p style={{ color: 'red', margin: 0 }}>{formErrors.password}</p>}
            </div>

            <div style={{ display: 'grid', gap: '0.25rem' }}>
                <label for="confirmPassword">Confirm Password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onInput={handleChange}
                    style={formErrors.confirmPassword ? { border: '1px solid red' } : {}}
                />
                {formErrors.confirmPassword && <p style={{ color: 'red', margin: 0 }}>{formErrors.confirmPassword}</p>}
            </div>

            <button type="submit">Register</button>
        </form>
    );
}

```

Another example with custom inputs:
```ts
import { DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { TextField, TextFieldErrorMessage, TextFieldLabel, TextFieldRoot } from "@/shared/ui/textfield";

import { Button } from "@/shared/ui/button";
import { TextFieldPassword } from "@/shared/ui/textfieldPassword";
import { api } from "@/shared/api";
import { useForm } from "solidjs-hook-form";
import z from "zod";

const schema = z.object({
    login: 
        z.string()
        .email()
        .min(6)
        .max(30),
    password: 
        z.string()
        .min(6)
        .max(30),
    passwordRepeat: 
        z.string()
}).superRefine(({ password, passwordRepeat }, ctx) => {
    if(password !== passwordRepeat) {
        ctx.addIssue({
            code: "custom",
            message: "Passwords do not match",
            path: ["passwordRepeat"]
        })
    }
})

export default function RegisterForm() {
    const { form, formErrors, handleChange, validate } = useForm(schema);

    const handleRegister = () => {
        if(validate()) {
            api.register(form);
        }
    }
    
    return (
        <>
            <DialogHeader>
                <DialogTitle class="text-center">Register</DialogTitle>
            </DialogHeader>
            <div class="grid gap-4 py-4">
                <TextFieldRoot 
                class="grid grid-cols-3 items-center gap-x-4 md:grid-cols-4"
                validationState={formErrors.login ? "invalid" : "valid"}
                >
                    <TextFieldLabel class="text-right">Login</TextFieldLabel>
                    <TextField 
                    class="col-span-2 md:col-span-3" 
                    placeholder={"email@example.com"}
                    value={form.login}
                    name="login" // name is required and must match the schema
                    onInput={handleChange}
                    />
                    <TextFieldErrorMessage class="col-span-2 col-start-2">{formErrors.login}</TextFieldErrorMessage>
                </TextFieldRoot>
                <TextFieldRoot 
                validationState={formErrors.password ? "invalid" : "valid"}
                class="grid grid-cols-3 items-center gap-x-4 md:grid-cols-4"
                >
                    <TextFieldLabel class="text-right">Password</TextFieldLabel>
                    <TextFieldPassword
                    wrapper={{ class: "col-span-2 md:col-span-3" }}
                    textfield={{
                        name: "password", // name is required and must match the schema
                        value: form.password,
                        onInput: handleChange
                    }} />
                    <TextFieldErrorMessage class="col-span-2 col-start-2">{formErrors.password}</TextFieldErrorMessage>
                </TextFieldRoot>
                <TextFieldRoot 
                validationState={formErrors.passwordRepeat ? "invalid" : "valid"}
                class="grid grid-cols-3 items-center gap-x-4 md:grid-cols-4"
                >
                    <TextFieldLabel class="text-right">Password Repeat</TextFieldLabel>
                    <TextFieldPassword
                    wrapper={{ class: "col-span-2 md:col-span-3" }}
                    textfield={{
                        name: "passwordRepeat", // name is required and must match the schema
                        value: form.passwordRepeat,
                        onInput: handleChange
                    }} />
                    <TextFieldErrorMessage class="col-span-2 col-start-2">{formErrors.passwordRepeat}</TextFieldErrorMessage>
                </TextFieldRoot>
            </div>
            <div class="flex justify-between">
                <Button variant={'link'} href="/login">
                    Already have an account?
                </Button>
                <Button variant={'link'} href="/reset-password">
                    Forgot password?
                </Button>
            </div>
            <DialogFooter>
                <Button onClick={handleRegister} type="submit" class="w-full" variant={"default"}>Register</Button>
            </DialogFooter>
        </>
    )
}
```