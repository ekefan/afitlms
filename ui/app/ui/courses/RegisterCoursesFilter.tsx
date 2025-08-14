'use client';


import { useState, useEffect } from 'react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// Sample cached faculties and departments
const faculties = [
    { id: "FGCE", name: "FGCE" },
    { id: "FAC", name: "FAC" },
    { id: "FOC", name: "FOC" },
];

// Departments keyed by faculty id
const departmentsByFaculty: Record<string, { id: string; name: string }[]> = {
    FGCE: [
        { id: "EEE", name: "EEE" },
        { id: "CEE", name: "CEE" },
        { id: "TEC", name: "TEC" },
    ],
    FAC: [
        { id: "AED", name: "AED" },
        { id: "MTE", name: "MTE" },
    ],
    FOC: [
        { id: "CSC", name: "CSC" },
        { id: "CYB", name: "CYB" },
    ],
};

// Levels fixed
const levels = ["100", "200", "300", "400", "500"];

export function FiltersDropdowns({
    onFilterCourses,
}: {
    onFilterCourses: (faculty: string | null, level: string | null, dept: string | null) => void;
}) {
    const [faculty, setFaculty] = useState<string | null>(null);
    const [level, setLevel] = useState<string | null>(null);
    const [department, setDepartment] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    const departments = faculty ? departmentsByFaculty[faculty] || [] : [];

    useEffect(() => {
        setIsClient(true);
        setDepartment(null);

    }, [faculty]);

    const applyFilters = () => {
        onFilterCourses(faculty, level, department);
    };

    if (!isClient) return;
    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex gap-3 flex-wrap">
                {/* Faculty Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="">
                        <Button variant="outline" className="">
                            {faculty
                                ? faculties.find(f => f.id === faculty)?.name
                                : "Select Faculty"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuLabel>Faculty</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {faculties.map(f => (
                            <DropdownMenuItem
                                key={f.id}
                                onSelect={() => setFaculty(f.id)}
                                className={faculty === f.id ? "font-semibold" : ""}
                            >
                                {f.name}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Level Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="min-w-[100px]">
                            {level ? level : "Select Level"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuLabel>Level</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {levels.map(l => (
                            <DropdownMenuItem
                                key={l}
                                onSelect={() => setLevel(l)}
                                className={level === l ? "font-semibold" : ""}
                            >
                                {l}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Department Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            className=""
                            disabled={!faculty}
                            title={!faculty ? "Select faculty first" : undefined}
                        >
                            {department
                                ? departments.find(d => d.id === department)?.name
                                : "Select Department"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuLabel>Department</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {departments.length === 0 ? (
                            <DropdownMenuItem disabled>
                                No departments available
                            </DropdownMenuItem>
                        ) : (
                            departments.map(d => (
                                <DropdownMenuItem
                                    key={d.id}
                                    onSelect={() => setDepartment(d.id)}
                                    className={department === d.id ? "font-semibold" : ""}
                                >
                                    {d.name}
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button onClick={applyFilters} className="self-start">
                    Apply Filters
                </Button>
            </div>

        </div>
    );
}
