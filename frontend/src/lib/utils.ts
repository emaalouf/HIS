import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatBloodType(bloodType: string): string {
    const map: Record<string, string> = {
        A_POSITIVE: 'A+',
        A_NEGATIVE: 'A-',
        B_POSITIVE: 'B+',
        B_NEGATIVE: 'B-',
        AB_POSITIVE: 'AB+',
        AB_NEGATIVE: 'AB-',
        O_POSITIVE: 'O+',
        O_NEGATIVE: 'O-',
        UNKNOWN: 'Unknown',
    };
    return map[bloodType] || bloodType;
}
