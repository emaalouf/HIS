import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastroColonoscopyService } from '../../services/gastro-colonoscopy.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { EndoscopyQuality, EndoscopyStatus, CreateGastroColonoscopyRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';

import { GastroNav } from './GastroNav';

const statusOptions: EndoscopyStatus[] = [
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
];

const qualityOptions: EndoscopyQuality[] = [
    'EXCELLENT',
    'GOOD',
    'FAIR',
    'POOR',
];

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type ColonoscopyFormState = {
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status: EndoscopyStatus;
    sedationType: string;
    scopeInsertion: string;
    cecalIntubation: boolean;
    cecalIntubationTime: string;
    withdrawalTime: string;
    prepQuality: EndoscopyQuality | '';
    ileumExamined: boolean;
    mucosalAppearance: string;
    lesionsFound: boolean;
    lesionsDescription: string;
    polypsFound: boolean;
    polypsRemoved: string;
    polypSizeMaxMm: string;
    polypHistology: string;
    biopsiesTaken: string;
    biopsySites: string;
    hemostasisPerformed: boolean;
    complications: string;
    recommendations: string;
    followUpInterval: string;
    notes: string;
};

export function GastroColonoscopyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultProcedureDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<ColonoscopyFormState>({
        patientId: '',
        providerId: '',
        procedureDate: defaultProcedureDate,
        indication: '',
        status: 'SCHEDULED',
        sedationType: '',
        scopeInsertion: '',
        cecalIntubation: false,
        cecalIntubationTime: '',
        withdrawalTime: '',
        prepQuality: '',
        ileumExamined: false,
        mucosalAppearance: '',
        lesionsFound: false,
        lesionsDescription: '',
        polypsFound: false,
        polypsRemoved: '',
        polypSizeMaxMm: '',
        polypHistology: '',
        biopsiesTaken: '',
        biopsySites: '',
        hemostasisPerformed: false,
        complications: '',
        recommendations: '',
        followUpInterval: '',
        notes: '',
    });

    const { data: colonoscopy, isLoading } = useQuery({
        queryKey: ['gastro-colonoscopy', id],
        queryFn: () => gastroColonoscopyService.getColonoscopy(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'gastro-colonoscopy-picker', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    const { data: providersData, isLoading: isProvidersLoading } = useQuery({
        queryKey: ['providers', 'gastro-colonoscopy-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!colonoscopy) return;
        setFormData({
            patientId: colonoscopy.patientId,
            providerId: colonoscopy.providerId || '',
            procedureDate: formatDateTimeLocal(new Date(colonoscopy.procedureDate)),
            indication: colonoscopy.indication || '',
            status: colonoscopy.status,
            sedationType: colonoscopy.sedationType || '',
            scopeInsertion: colonoscopy.scopeInsertion || '',
            cecalIntubation: colonoscopy.cecalIntubation || false,
            cecalIntubationTime: colonoscopy.cecalIntubationTime?.toString() || '',
            withdrawalTime: colonoscopy.withdrawalTime?.toString() || '',
            prepQuality: colonoscopy.prepQuality || '',
            ileumExamined: colonoscopy.ileumExamined || false,
            mucosalAppearance: colonoscopy.mucosalAppearance || '',
            lesionsFound: colonoscopy.lesionsFound || false,
            lesionsDescription: colonoscopy.lesionsDescription || '',
            polypsFound: colonoscopy.polypsFound || false,
            polypsRemoved: colonoscopy.polypsRemoved?.toString() || '',
            polypSizeMaxMm: colonoscopy.polypSizeMaxMm?.toString() || '',
            polypHistology: colonoscopy.polypHistology || '',
            biopsiesTaken: colonoscopy.biopsiesTaken?.toString() || '',
            biopsySites: colonoscopy.biopsySites || '',
            hemostasisPerformed: colonoscopy.hemostasisPerformed || false,
            complications: colonoscopy.complications || '',
            recommendations: colonoscopy.recommendations || '',
            followUpInterval: colonoscopy.followUpInterval || '',
            notes: colonoscopy.notes || '',
        });
        if (colonoscopy.patient) {
            setPatientInput(`${colonoscopy.patient.firstName} ${colonoscopy.patient.lastName}`);
        } else {
            setPatientInput(colonoscopy.patientId);
        }
        if (colonoscopy.provider) {
            const prefix = colonoscopy.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${colonoscopy.provider.firstName} ${colonoscopy.provider.lastName}`);
        } else if (colonoscopy.providerId) {
            setProviderInput(colonoscopy.providerId);
        }
    }, [colonoscopy]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateGastroColonoscopyRequest) => gastroColonoscopyService.createColonoscopy(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-colonoscopies'] });
            navigate('/gastroenterology/colonoscopies');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateGastroColonoscopyRequest) => gastroColonoscopyService.updateColonoscopy(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-colonoscopies'] });
            queryClient.invalidateQueries({ queryKey: ['gastro-colonoscopy', id] });
            navigate('/gastroenterology/colonoscopies');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const toNumber = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return undefined;
        const num = Number(trimmed);
        return Number.isNaN(num) ? undefined : num;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.patientId) {
            setError('Please select a patient.');
            return;
        }

        if (!formData.providerId) {
            setError('Please select a provider.');
            return;
        }

        if (!formData.indication.trim()) {
            setError('Please enter an indication.');
            return;
        }

        const payload: CreateGastroColonoscopyRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            procedureDate: formData.procedureDate,
            indication: formData.indication,
            status: formData.status,
            sedationType: formData.sedationType || undefined,
            scopeInsertion: formData.scopeInsertion || undefined,
            cecalIntubation: formData.cecalIntubation || undefined,
            cecalIntubationTime: toNumber(formData.cecalIntubationTime),
            withdrawalTime: toNumber(formData.withdrawalTime),
            prepQuality: formData.prepQuality || undefined,
            ileumExamined: formData.ileumExamined || undefined,
            mucosalAppearance: formData.mucosalAppearance || undefined,
            lesionsFound: formData.lesionsFound || undefined,
            lesionsDescription: formData.lesionsDescription || undefined,
            polypsFound: formData.polypsFound || undefined,
            polypsRemoved: toNumber(formData.polypsRemoved),
            polypSizeMaxMm: toNumber(formData.polypSizeMaxMm),
            polypHistology: formData.polypHistology || undefined,
            biopsiesTaken: toNumber(formData.biopsiesTaken),
            biopsySites: formData.biopsySites || undefined,
            hemostasisPerformed: formData.hemostasisPerformed || undefined,
            complications: formData.complications || undefined,
            recommendations: formData.recommendations || undefined,
            followUpInterval: formData.followUpInterval || undefined,
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const patientOptions: SelectOption[] = (patientsData?.patients || []).map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: patient.mrn,
    }));

    const providerOptions: SelectOption[] = (providersData?.providers || []).map((provider) => ({
        id: provider.id,
        label: `${provider.role === 'DOCTOR' ? 'Dr. ' : ''}${provider.firstName} ${provider.lastName}`,
        subLabel: provider.role,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Colonoscopy' : 'New Colonoscopy'}
                    </h1>
                    <p className="text-gray-500 mt-1">Record colonoscopy procedure details and findings.</p>
                </div>
                <Link to="/gastroenterology/colonoscopies">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Colonoscopies
                    </Button>
                </Link>
            </div>

            <GastroNav />

            <Card>
                <CardHeader>
                    <CardTitle>Colonoscopy Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-100">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SearchableSelect
                                label="Patient"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => setPatientInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Provider"
                                placeholder="Search providers..."
                                value={providerInput}
                                required
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                onInputChange={(value) => setProviderInput(value)}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                            <Input
                                label="Procedure Date"
                                type="datetime-local"
                                value={formData.procedureDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, procedureDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as EndoscopyStatus }))}
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Indication <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.indication}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, indication: e.target.value }))}
                                    placeholder="Clinical indication for the procedure"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Input
                                label="Sedation Type"
                                value={formData.sedationType}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sedationType: e.target.value }))}
                                placeholder="e.g., Conscious sedation"
                            />
                            <Input
                                label="Scope Insertion"
                                value={formData.scopeInsertion}
                                onChange={(e) => setFormData((prev) => ({ ...prev, scopeInsertion: e.target.value }))}
                                placeholder="e.g., Rectal"
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prep Quality</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.prepQuality}
                                    onChange={(e) => setFormData(prev => ({ ...prev, prepQuality: e.target.value as EndoscopyQuality | '' }))}
                                >
                                    <option value="">Select quality...</option>
                                    {qualityOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Procedure Metrics</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="cecalIntubation"
                                        checked={formData.cecalIntubation}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, cecalIntubation: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="cecalIntubation" className="text-sm font-medium text-gray-700">
                                        Cecal Intubation Achieved
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="ileumExamined"
                                        checked={formData.ileumExamined}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, ileumExamined: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="ileumExamined" className="text-sm font-medium text-gray-700">
                                        Ileum Examined
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Cecal Intubation Time (minutes)"
                                type="number"
                                value={formData.cecalIntubationTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, cecalIntubationTime: e.target.value }))}
                                placeholder="Time to reach cecum"
                            />
                            <Input
                                label="Withdrawal Time (minutes)"
                                type="number"
                                value={formData.withdrawalTime}
                                onChange={(e) => setFormData((prev) => ({ ...prev, withdrawalTime: e.target.value }))}
                                placeholder="Scope withdrawal time"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Findings & Interventions</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="lesionsFound"
                                        checked={formData.lesionsFound}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, lesionsFound: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="lesionsFound" className="text-sm font-medium text-gray-700">
                                        Lesions Found
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="polypsFound"
                                        checked={formData.polypsFound}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, polypsFound: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="polypsFound" className="text-sm font-medium text-gray-700">
                                        Polyps Found
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="hemostasisPerformed"
                                        checked={formData.hemostasisPerformed}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, hemostasisPerformed: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="hemostasisPerformed" className="text-sm font-medium text-gray-700">
                                        Hemostasis Performed
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Mucosal Appearance"
                                value={formData.mucosalAppearance}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mucosalAppearance: e.target.value }))}
                                placeholder="General mucosal appearance"
                            />
                            <Input
                                label="Polyp Histology"
                                value={formData.polypHistology}
                                onChange={(e) => setFormData((prev) => ({ ...prev, polypHistology: e.target.value }))}
                                placeholder="Histology results if available"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Lesions Description</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.lesionsDescription}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, lesionsDescription: e.target.value }))}
                                    placeholder="Description of any lesions found"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Biopsy Sites</label>
                                <Input
                                    value={formData.biopsySites}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, biopsySites: e.target.value }))}
                                    placeholder="Sites where biopsies were taken"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <Input
                                label="Polyps Removed"
                                type="number"
                                value={formData.polypsRemoved}
                                onChange={(e) => setFormData((prev) => ({ ...prev, polypsRemoved: e.target.value }))}
                                placeholder="Number of polyps removed"
                            />
                            <Input
                                label="Max Polyp Size (mm)"
                                type="number"
                                value={formData.polypSizeMaxMm}
                                onChange={(e) => setFormData((prev) => ({ ...prev, polypSizeMaxMm: e.target.value }))}
                                placeholder="Size of largest polyp"
                            />
                            <Input
                                label="Biopsies Taken"
                                type="number"
                                value={formData.biopsiesTaken}
                                onChange={(e) => setFormData((prev) => ({ ...prev, biopsiesTaken: e.target.value }))}
                                placeholder="Number of biopsies"
                            />
                            <Input
                                label="Follow-up Interval"
                                value={formData.followUpInterval}
                                onChange={(e) => setFormData((prev) => ({ ...prev, followUpInterval: e.target.value }))}
                                placeholder="e.g., 1 year, 3 years"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complications</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.complications}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, complications: e.target.value }))}
                                    placeholder="Any complications during the procedure"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Recommendations</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.recommendations}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, recommendations: e.target.value }))}
                                    placeholder="Post-procedure recommendations"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.notes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                    placeholder="Additional notes"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Colonoscopy' : 'Create Colonoscopy'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
