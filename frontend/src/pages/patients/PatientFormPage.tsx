import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../../services/patient.service';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { Gender, BloodType, CreatePatientRequest } from '../../types';

export function PatientFormPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<CreatePatientRequest>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'MALE' as Gender,
        bloodType: 'UNKNOWN' as BloodType,
        phone: '',
        email: '',
        address: '',
        city: '',
        country: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelation: '',
        allergies: [],
        chronicConditions: [],
    });

    const [allergiesInput, setAllergiesInput] = useState('');
    const [conditionsInput, setConditionsInput] = useState('');

    const createMutation = useMutation({
        mutationFn: patientService.createPatient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patients'] });
            queryClient.invalidateQueries({ queryKey: ['patientStats'] });
            navigate('/patients');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const data: CreatePatientRequest = {
            ...formData,
            allergies: allergiesInput.split(',').map(s => s.trim()).filter(Boolean),
            chronicConditions: conditionsInput.split(',').map(s => s.trim()).filter(Boolean),
        };

        createMutation.mutate(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/patients">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">New Patient</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="First Name *"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Last Name *"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Date of Birth *"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                                <select
                                    name="bloodType"
                                    value={formData.bloodType}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="UNKNOWN">Unknown</option>
                                    <option value="A_POSITIVE">A+</option>
                                    <option value="A_NEGATIVE">A-</option>
                                    <option value="B_POSITIVE">B+</option>
                                    <option value="B_NEGATIVE">B-</option>
                                    <option value="AB_POSITIVE">AB+</option>
                                    <option value="AB_NEGATIVE">AB-</option>
                                    <option value="O_POSITIVE">O+</option>
                                    <option value="O_NEGATIVE">O-</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Phone *"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Input
                                label="Address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                            />
                            <Input
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <Input
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                    <CardHeader>
                        <CardTitle>Emergency Contact</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Name"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Phone"
                                name="emergencyContactPhone"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                            />
                            <Input
                                label="Relationship"
                                name="emergencyContactRelation"
                                value={formData.emergencyContactRelation}
                                onChange={handleChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Medical Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Medical Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Allergies (comma separated)"
                                value={allergiesInput}
                                onChange={(e) => setAllergiesInput(e.target.value)}
                                placeholder="e.g., Penicillin, Peanuts"
                            />
                            <Input
                                label="Chronic Conditions (comma separated)"
                                value={conditionsInput}
                                onChange={(e) => setConditionsInput(e.target.value)}
                                placeholder="e.g., Diabetes, Hypertension"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={createMutation.isPending}>
                        <Save size={18} className="mr-2" />
                        Save Patient
                    </Button>
                </div>
            </form>
        </div>
    );
}
