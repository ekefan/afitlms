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


export default function CreateUser() {
    const formSchema = z.object(
        {
            email: z.string().email({ message: "sample: user@sample.com" }),
            fullname: z.string().min(2, { message: "sample John Doe" }),
            schID: z.string().min(2, { message: "sample U19-EEE-110" }),
        }
    )

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            fullname: "",
            schID: "",
        },
    })
    const router = useRouter()
    const onSubmit = async (data: z.infer<typeof formSchema>) => {

        const params = new URLSearchParams({
            fullname: data.fullname,
            email: data.email,
            schID: data.schID,
        })

        router.push(`/dashboard/users/enrollments/${data.schID}/assign_roles?${params.toString()}`)
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="fullname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input placeholder="enter user's full name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="enter email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="schID"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>User School ID</FormLabel>
                            <FormControl>
                                <Input placeholder="student ID" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit">Create User</Button>
            </form>
        </Form>

    )
}