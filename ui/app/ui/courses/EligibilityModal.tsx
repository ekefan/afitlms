// app/ui/courses/EligibilityModal.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

type CourseData = {
    course_code: string;
    course_name: string;
    faculty: string;
    level: string; // Assuming level might come as a string from API
    department: string;
}


type StudentEligibility = {
    student_name: string;
    matric_number: string;
    eligibility: number;
};

type EligibilityList = {
    course_data: CourseData;
    student_eligibility: StudentEligibility[];
};

interface EligibilityModalProps {
    eligibilityList: EligibilityList;
    onClose: () => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({ eligibilityList, onClose }) => {
    const handleDownloadPdf = async () => {
        toast.info("Generating PDF...", {
            description: `Creating a beautifully arranged PDF for ${eligibilityList.course_data.course_code}.`,
            duration: 3000,
        });

        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const primaryColor = rgb(0.1, 0.2, 0.4); // Dark blue for headers
            const textColor = rgb(0.2, 0.2, 0.2); // Slightly darker gray for text
            const lightGray = rgb(0.95, 0.95, 0.95); // For alternating row background
            const headerBgColor = rgb(0.85, 0.85, 0.85); // Header background color

            const PAGE_MARGIN = 50;
            const LINE_HEIGHT = 18;
            const TABLE_ROW_HEIGHT = 20;
            const TABLE_HEADER_HEIGHT = 25;

            let currentPage = pdfDoc.addPage();
            let { width, height } = currentPage.getSize();
            let yPosition = height - PAGE_MARGIN; // Starting Y position

            const resetPage = () => {
                currentPage = pdfDoc.addPage();
                width = currentPage.getSize().width;
                height = currentPage.getSize().height;
                yPosition = height - PAGE_MARGIN;
            };

            // --- Document Title ---
            currentPage.drawText(`Eligibility List`, {
                x: PAGE_MARGIN,
                y: yPosition,
                size: 28,
                font: boldFont,
                color: primaryColor,
            });
            yPosition -= 40; // Space after title

            // --- Course Information ---
            currentPage.drawText(`${eligibilityList.course_data.course_name} (${eligibilityList.course_data.course_code})`, {
                x: PAGE_MARGIN,
                y: yPosition,
                size: 20,
                font: boldFont,
                color: textColor,
            });
            yPosition -= (LINE_HEIGHT + 5); // Space after course name/code

            currentPage.drawText(`Faculty: ${eligibilityList.course_data.faculty}`, {
                x: PAGE_MARGIN,
                y: yPosition,
                size: 12,
                font: font,
                color: textColor,
            });
            yPosition -= LINE_HEIGHT;

            currentPage.drawText(`Department: ${eligibilityList.course_data.department}`, {
                x: PAGE_MARGIN,
                y: yPosition,
                size: 12,
                font: font,
                color: textColor,
            });
            yPosition -= LINE_HEIGHT;

            currentPage.drawText(`Level: ${eligibilityList.course_data.level}`, {
                x: PAGE_MARGIN,
                y: yPosition,
                size: 12,
                font: font,
                color: textColor,
            });
            yPosition -= 30; // Space before table

            // --- Table Setup ---
            const tableHeaders = ["Student Name", "Matric Number", "Eligibility (%)"];
            const columnWidths = [
                width * 0.40, // Student Name (40% of page width)
                width * 0.25, // Matric Number (25% of page width)
                width * 0.15  // Eligibility (15% of page width)
            ];
            const startX = PAGE_MARGIN;

            // Function to draw table headers
            const drawTableHeaders = () => {
                let currentX = startX;
                currentPage.drawRectangle({
                    x: currentX,
                    y: yPosition - TABLE_HEADER_HEIGHT,
                    width: columnWidths[0] + columnWidths[1] + columnWidths[2],
                    height: TABLE_HEADER_HEIGHT,
                    color: headerBgColor,
                });
                tableHeaders.forEach((header, i) => {
                    currentPage.drawText(header, {
                        x: currentX + 5, // Small padding
                        y: yPosition - TABLE_HEADER_HEIGHT / 2 - 5, // Center vertically
                        size: 11,
                        font: boldFont,
                        color: primaryColor,
                    });
                    currentX += columnWidths[i];
                });
                yPosition -= TABLE_HEADER_HEIGHT;
            };

            drawTableHeaders(); // Draw headers for the first page

            // --- Table Data ---
            eligibilityList.student_eligibility.forEach((student, index) => {
                // Check if we need a new page
                if (yPosition < PAGE_MARGIN + TABLE_ROW_HEIGHT + 10) { // +10 for some buffer
                    resetPage();
                    drawTableHeaders(); // Draw headers on the new page
                }

                // Alternating row background
                if (index % 2 === 0) {
                    currentPage.drawRectangle({
                        x: startX,
                        y: yPosition - TABLE_ROW_HEIGHT,
                        width: columnWidths[0] + columnWidths[1] + columnWidths[2],
                        height: TABLE_ROW_HEIGHT,
                        color: lightGray,
                    });
                }

                // Draw table data
                currentPage.drawText(student.student_name, {
                    x: startX + 5,
                    y: yPosition - TABLE_ROW_HEIGHT / 2 - 5,
                    size: 10,
                    font: font,
                    color: textColor,
                });
                currentPage.drawText(student.matric_number, {
                    x: startX + columnWidths[0] + 5,
                    y: yPosition - TABLE_ROW_HEIGHT / 2 - 5,
                    size: 10,
                    font: font,
                    color: textColor,
                });
                // Align Eligibility to center/right
                const eligibilityText = `${Math.ceil(student.eligibility * 100)}%`;
                const eligibilityTextWidth = font.widthOfTextAtSize(eligibilityText, 10);
                currentPage.drawText(eligibilityText, {
                    x: startX + columnWidths[0] + columnWidths[1] + (columnWidths[2] / 2) - (eligibilityTextWidth / 2),
                    y: yPosition - TABLE_ROW_HEIGHT / 2 - 5,
                    size: 10,
                    font: font,
                    color: textColor,
                });

                // Draw lines for table cells (optional, but adds to "table" look)
                currentPage.drawLine({
                    start: { x: startX, y: yPosition },
                    end: { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y: yPosition },
                    thickness: 0.5,
                    color: rgb(0.7, 0.7, 0.7),
                });

                yPosition -= TABLE_ROW_HEIGHT;
            });

            // Draw bottom line for the last row
            currentPage.drawLine({
                start: { x: startX, y: yPosition },
                end: { x: startX + columnWidths[0] + columnWidths[1] + columnWidths[2], y: yPosition },
                thickness: 0.5,
                color: rgb(0.7, 0.7, 0.7),
            });


            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${eligibilityList.course_data.course_code}_eligibility_list.pdf`;
            link.click();
            URL.revokeObjectURL(url);

            toast.success("PDF Generated and Downloaded!", {
                description: `The eligibility list for ${eligibilityList.course_data.course_code} has been downloaded.`,
            });
        } catch (error: any) {
            console.error("Failed to generate PDF:", error);
            toast.error("PDF Generation Failed", {
                description: `Could not generate the PDF: ${error.message || 'Unknown error'}. Please try again.`,
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-black bg-white bg-opacity-50 p-4">
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h2 className="text-2xl font-bold">Eligibility List</h2>
                        <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </Button>
                    </div>

                    <h3 className="text-xl font-semibold mb-2">
                        {eligibilityList.course_data.course_code} - {eligibilityList.course_data.course_name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Faculty: {eligibilityList.course_data.faculty},
                        Department: {eligibilityList.course_data.department},
                        Level: {eligibilityList.course_data.level}
                    </p>

                    {eligibilityList.student_eligibility.length === 0 ? (
                        <p className="text-gray-700">No students found for this course's eligibility.</p>
                    ) : (
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Student Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Matric Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Eligibility (%)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className=" divide-y">
                                    {eligibilityList.student_eligibility.map((student, idx) => (
                                        <tr key={idx} className="hover:bg-gray-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {student.student_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {student.matric_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {Math.ceil(student.eligibility * 100)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <Button onClick={handleDownloadPdf}>Download PDF</Button>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};