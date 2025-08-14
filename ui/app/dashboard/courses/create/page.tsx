"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { API_BASE_URL } from "@/lib/constants"


const formSchema = z.object({
    course_code: z.string().regex(/^[A-Z]{3}\d{3}$/, {
        message: 'Course code must be in the format AAA123 (e.g,, EEE406, CSC101).'
    }),
    faculty: z.string()
        .regex(/^[A-Z]{3,4}$/, { // Updated regex for faculty
            message: "Faculty must be 3 or 4 uppercase letters (e.g., SCI, ENGR).",
        }),
    level: z.string().regex(/^(100|200|300|400|500)$/, {
        message: "Level must be 100, 200, 300, 400, or 500.",
    }),
    department: z.string().regex(/^[A-Z]{3}$/, {
        message: "Department must be exactly three uppercase letters (e.g., EEE, CEE).",
    }),
    name: z.string()
})


export default function DashboardPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            department: "",
            level: "",
            faculty: "",
            course_code: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        const createCourse = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/courses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(values),
                }
                );

                if (!(res.ok)) {
                    const errorData = await res.json();
                    const errorMessage = errorData.error || errorData.message || 'Failed to send';
                    console.error('API ERROR Response', errorData, errorMessage);
                }

                const result = await res.json();
                console.log("Course created successfully:", result);
                alert("Course created successfully!");
            } catch (err: any) {
                console.log("Error creating course", err.message);
            }
        }

        createCourse();
    }
    return (
        <div className="">
            <h1 className="mb-6">
                Create New Course
            </h1>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Title</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g Applied Electronics" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="course_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g CSC101" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="faculty"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Faculty</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g FGCE, the initials of your faculty" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g FGCE, the initials of your faculty" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="level"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Level</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g FGCE, the initials of your faculty" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        </div>
    );
}
