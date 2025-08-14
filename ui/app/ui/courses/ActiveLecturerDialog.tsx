'use client';

import { useState, useMemo } from 'react'; // Import useMemo
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/constants';

// Define explicit statuses for clarity
enum LecturerStatus {
    NotAssigned = 0,        // No active lecturer for this course
    CurrentUserActive = 1,  // Current user is the active lecturer
    OtherLecturerActive = 2 // Another lecturer is currently active
}

export default function ActiveLecturerDialog({
    userId, // Prop: ID of the current logged-in user (string | null)
    courseCode, // Prop: Code of the course (string | null)
    activeLecturerId, // Prop: ID of the active lecturer for THIS course (number)
    onSetActiveLecturer, // Callback to refresh course data after action
}: {
    userId: string | null;
    courseCode: string | null;
    activeLecturerId: number;
    onSetActiveLecturer: () => void;
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false); // State to control dialog open/close

    // Convert userId to a number for comparison, or null if not available
    const currentUserIdNum = useMemo(() => (userId ? parseInt(userId, 10) : null), [userId]);

    // Determine the derived status of the lecturer for the current course
    const courseLecturerStatus = useMemo(() => {
        if (activeLecturerId === 0) {
            return LecturerStatus.NotAssigned;
        } else if (currentUserIdNum && activeLecturerId === currentUserIdNum) {
            return LecturerStatus.CurrentUserActive;
        } else {
            return LecturerStatus.OtherLecturerActive;
        }
    }, [activeLecturerId, currentUserIdNum]);

    const handleSetActive = async () => {
        await performFetchAction(`${API_BASE_URL}/users/lecturers/${currentUserIdNum}/course_assignments/${courseCode}`);
    };

    const handleSetNotActive = async () => {
        await performFetchAction(`${API_BASE_URL}/users/lecturers/${currentUserIdNum}/course_assignments/${courseCode}/${currentUserIdNum}`);
    };


    // Determine button properties based on status
    const { buttonColorClass, buttonLabel, buttonDisabled, dialogTitle, dialogDescription, confirmButtonLabel, handleConfirmAction } = useMemo(() => {
        let colorClass = 'border-gray-200'; // Default
        let label = 'Unknown Status';
        let disabled = false;
        let title = '';
        let description = '';
        let confirmLabel = '';
        let action: (() => Promise<void>) | null = null; // Will store the async function to call

        switch (courseLecturerStatus) {
            case LecturerStatus.CurrentUserActive:
                colorClass = 'border-green-400';
                label = 'Active Lecturer';
                disabled = false; // Allow current user to set themselves inactive
                title = 'Confirm Deactivation';
                description = 'Are you sure you want to remove yourself as the active lecturer for this course? This will remove your responsibility.';
                confirmLabel = 'Yes, Set as Inactive';
                action = handleSetNotActive;
                break;
            case LecturerStatus.OtherLecturerActive:
                colorClass = 'border-purple-400';
                label = 'Another Lecturer Is Active';
                disabled = true; // Cannot change if someone else is active
                title = 'Active Lecturer Present';
                description = 'Another lecturer is currently assigned to this course. You cannot become active until they are unassigned.';
                confirmLabel = 'Understood'; // Or just close the dialog
                action = null; // No action for this dialog
                break;
            case LecturerStatus.NotAssigned:
            default: // Default to NotAssigned if status is 0 or unexpected
                colorClass = 'border-red-400';
                label = 'Become Active Lecturer';
                disabled = false;
                title = 'Confirm Activation';
                description = 'Are you sure you want to set yourself as the active lecturer for this course? This will make you responsible for this if allowed.';
                confirmLabel = 'Yes, Set as Active';
                action = handleSetActive;
                break;
        }
        return {
            buttonColorClass: colorClass,
            buttonLabel: label,
            buttonDisabled: disabled,
            dialogTitle: title,
            dialogDescription: description,
            confirmButtonLabel: confirmLabel,
            handleConfirmAction: action, // Pass the function reference
        };
    }, [courseLecturerStatus, handleSetActive, handleSetNotActive]); // Add handlers to dependencies


    const performFetchAction = async (urlToSendTo: string) => {
        if (!currentUserIdNum || !courseCode) {
            console.warn("User ID or Course Code not available for API call.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(urlToSendTo, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`, // Safe access to localStorage
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'No additional error info' }));
                console.error(`Failed to set/remove active lecturer: ${response.status} ${response.statusText}`, errorData);
                throw new Error(errorData.message || 'Failed to update lecturer status');
            }

            // On success, close dialog and trigger parent refresh
            setDialogOpen(false);
            onSetActiveLecturer();
        } catch (error) {
            console.error('API call error:', error);
            // Optionally, show a toast/notification to the user
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                <button
                    className={`text-foreground ${buttonColorClass} hover:opacity-80 opacity-90 border-x-2 p-3 font-semibold items-center justify-center flex text-sm  transition-opacity duration-200 w-32 md:w-64`}
                    disabled={buttonDisabled || isSubmitting} // Use buttonDisabled from useMemo
                >
                    {isSubmitting ? 'Loading...' : buttonLabel}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>
                    {dialogDescription}
                </DialogDescription>
                <div className="flex justify-end space-x-4 mt-4">
                    {/* Render action button only if there's an associated action */}
                    {handleConfirmAction && (
                        <Button onClick={handleConfirmAction} disabled={isSubmitting}>
                            {isSubmitting ? 'Processing...' : confirmButtonLabel}
                        </Button>
                    )}
                    {/* Add a Cancel/Close button */}
                    <Button onClick={() => setDialogOpen(false)} variant="secondary">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}