"use client"

import { z } from "zod"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { API_BASE_URL } from "@/lib/constants"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"



export default function LoginPage() {
    const formSchema = z.object({
        email: z.string().email({ message: "sample: user@example.com" }),
        password: z.string({ message: "enter your password" }).min(6, { message: "password must be at least 6 characters" }),
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    const router = useRouter();

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        try {
            const result = await submitForm(data);
            if (!result.success) {
                form.setError('email', { type: 'server', message: result.message });
                form.setError('password', { type: 'server', message: result.message });
                return;
            }
            router.push('/dashboard');
        } catch (error) {
            console.error('Unexpected error in onSubmit: ', error)
            alert("failed to login try again later")
        }
    };

    return (
        <div className="p-8 rounded-lg shadow-xl w-full max-w-md border">
            <h1 className="text-3xl font-bold text-center mb-6">
                Login to AFIT LMS
            </h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="enter your email" {...field} />
                                </FormControl>
                                <FormMessage />

                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="enter your password" {...field} />
                                </FormControl>
                                <FormMessage />

                            </FormItem>
                        )}
                    />
                    <Button type="submit">Login</Button>
                </form>
            </Form>
        </div>

    );
}


// TODO: use this function to submit form data to the server
async function submitForm({ email, password }: { email: string; password: string }) {
    const url = `${API_BASE_URL}/users/auth`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const resData = await response.json();

        if (!response.ok) {
            console.log(response.body);
            return { success: false, message: 'Ensure fields are valid' };
        }

        console.log(resData);
        // Assuming resData matches LoginResponse interface
        localStorage.setItem('access_token', resData.tokens.access_token);
        localStorage.setItem('refresh_token', resData.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(resData.user_data));

        return { success: true };
    } catch (error) {
        console.error('Error during login:', error);
        return {
            success: false, message: `${error}`
        };
    }
}
