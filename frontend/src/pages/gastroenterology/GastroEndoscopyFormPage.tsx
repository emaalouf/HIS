import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastroEndoscopyService } from '../../services/gastro-endoscopy.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { EndoscopyQuality, EndoscopyStatus, CreateGastroEndoscopyRequest } from '../../types';
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

type EndoscopyFormState = {
    patientId: string;
    providerId: string;
    procedureDate: string;
    indication: string;
    status: EndoscopyStatus;
    sedationType: string;
    scopeInsertion: string;
    esophagus: string;
    gastroesophagealJunction: string;
    stomach: string;
    pylorus: string;
    duodenum: string;
    mucosalAppearance: string;
    lesionsFound: boolean;
    lesionsDescription: string;
    biopsiesTaken: string;
    biopsySites: string;
    hemostasisPerformed: boolean;
    hemostasisMethod: string;
    polypectomy: boolean;
    polypsRemoved: string;
    polypSizeMm: string;
    complications: string;
    recommendations: string;
    followUpInterval: string;
    prepQuality: EndoscopyQuality | '';
    notes: string;
};

export function GastroEndoscopyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultProcedureDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<EndoscopyFormState>({
        patientId: '',
        providerId: '',
        procedureDate: defaultProcedureDate,
        indication: '',
        status: 'SCHEDULED',
        sedationType: '',
        scopeInsertion: '',
        esophagus: '',
        gastroesophagealJunction: '',
        stomach: '',
        pylorus: '',
        duodenum: '',
        mucosalAppearance: '',
        lesionsFound: false,
        lesionsDescription: '',
        biopsiesTaken: '',
        biopsySites: '',
        hemostasisPerformed: false,
        hemostasisMethod: '',
        polypectomy: false,
        polypsRemoved: '',
        polypSizeMm: '',
        complications: '',
        recommendations: '',
        followUpInterval: '',
        prepQuality: '',
        notes: '',
    });

    const { data: endoscopy, isLoading } = useQuery({
        queryKey: ['gastro-endoscopy', id],
        queryFn: () => gastroEndoscopyService.getEndoscopy(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'gastro-endoscopy-picker', patientSearch],
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
        queryKey: ['providers', 'gastro-endoscopy-picker', providerSearch],
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
        if (!endoscopy) return;
        setFormData({
            patientId: endoscopy.patientId,
            providerId: endoscopy.providerId || '',
            procedureDate: formatDateTimeLocal(new Date(endoscopy.procedureDate)),
            indication: endoscopy.indication || '',
            status: endoscopy.status,
            sedationType: endoscopy.sedationType || '',
            scopeInsertion: endoscopy.scopeInsertion || '',
            esophagus: endoscopy.esophagus || '',
            gastroesophagealJunction: endoscopy.gastroesophagealJunction || '',
            stomach: endoscopy.stomach || '',
            pylorus: endoscopy.pylorus || '',
            duodenum: endoscopy.duodenum || '',
            mucosalAppearance: endoscopy.mucosalAppearance || '',
            lesionsFound: endoscopy.lesionsFound || false,
            lesionsDescription: endoscopy.lesionsDescription || '',
            biopsiesTaken: endoscopy.biopsiesTaken?.toString() || '',
            biopsySites: endoscopy.biopsySites || '',
            hemostasisPerformed: endoscopy.hemostasisPerformed || false,
            hemostasisMethod: endoscopy.hemostasisMethod || '',
            polypectomy: endoscopy.polypectomy || false,
            polypsRemoved: endoscopy.polypsRemoved?.toString() || '',
            polypSizeMm: endoscopy.polypSizeMm?.toString() || '',
            complications: endoscopy.complications || '',
            recommendations: endoscopy.recommendations || '',
            followUpInterval: endoscopy.followUpInterval || '',
            prepQuality: endoscopy.prepQuality || '',
            notes: endoscopy.notes || '',
        });
        if (endoscopy.patient) {
            setPatientInput(`${endoscopy.patient.firstName} ${endoscopy.patient.lastName}`);
        } else {
            setPatientInput(endoscopy.patientId);
        }
        if (endoscopy.provider) {
            const prefix = endoscopy.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${endoscopy.provider.firstName} ${endoscopy.provider.lastName}`);
        } else if (endoscopy.providerId) {
            setProviderInput(endoscopy.providerId);
        }
    }, [endoscopy]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateGastroEndoscopyRequest) => gastroEndoscopyService.createEndoscopy(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-endoscopies'] });
            navigate('/gastroenterology/endoscopies');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateGastroEndoscopyRequest) => gastroEndoscopyService.updateEndoscopy(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-endoscopies'] });
            queryClient.invalidateQueries({ queryKey: ['gastro-endoscopy', id] });
            navigate('/gastroenterology/endoscopies');
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

        const payload: CreateGastroEndoscopyRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            procedureDate: formData.procedureDate,
            indication: formData.indication,
            status: formData.status,
            sedationType: formData.sedationType || undefined,
            scopeInsertion: formData.scopeInsertion || undefined,
            esophagus: formData.esophagus || undefined,
            gastroesophagealJunction: formData.gastroesophagealJunction || undefined,
            stomach: formData.stomach || undefined,
            pylorus: formData.pylorus || undefined,
            duodenum: formData.duodenum || undefined,
            mucosalAppearance: formData.mucosalAppearance || undefined,
            lesionsFound: formData.lesionsFound || undefined,
            lesionsDescription: formData.lesionsDescription || undefined,
            biopsiesTaken: toNumber(formData.biopsiesTaken),
            biopsySites: formData.biopsySites || undefined,
            hemostasisPerformed: formData.hemostasisPerformed || undefined,
            hemostasisMethod: formData.hemostasisMethod || undefined,
            polypectomy: formData.polypectomy || undefined,
            polypsRemoved: toNumber(formData.polypsRemoved),
            polypSizeMm: toNumber(formData.polypSizeMm),
            complications: formData.complications || undefined,
            recommendations: formData.recommendations || undefined,
            followUpInterval: formData.followUpInterval || undefined,
            prepQuality: formData.prepQuality || undefined,
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
                        {isEditMode ? 'Edit Endoscopy' : 'New Endoscopy'}
                    </h1>
                    <p className="text-gray-500 mt-1">Record upper endoscopy procedure details and findings.</p>
                </div>
                <Link to="/gastroenterology/endoscopies">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Endoscopies
                    </Button>
                </Link>
            </div>

            <GastroNav />

            <Card>
                <CardHeader>
                    <CardTitle>Endoscopy Details</CardTitle>
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
                                placeholder="e.g., Oral, transnasal"
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

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Esophagus"
                                value={formData.esophagus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, esophagus: e.target.value }))}
                                placeholder="Esophageal findings"
                            />
                            <Input
                                label="Gastroesophageal Junction"
                                value={formData.gastroesophagealJunction}
                                onChange={(e) => setFormData((prev) => ({ ...prev, gastroesophagealJunction: e.target.value }))}
                                placeholder="GE junction findings"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stomach</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.stomach}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, stomach: e.target.value }))}
                                    placeholder="Gastric findings"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Duodenum</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[80px]"
                                    value={formData.duodenum}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, duodenum: e.target.value }))}
                                    placeholder="Duodenal findings"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Pylorus"
                                value={formData.pylorus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, pylorus: e.target.value }))}
                                placeholder="Pyloric findings"
                            />
                            <Input
                                label="Mucosal Appearance"
                                value={formData.mucosalAppearance}
                                onChange={(e) => setFormData((prev) => ({ ...prev, mucosalAppearance: e.target.value }))}
                                placeholder="General mucosal appearance"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Findings & Interventions</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                        id="hemostasisPerformed"
                                        checked={formData.hemostasisPerformed}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, hemostasisPerformed: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="hemostasisPerformed" className="text-sm font-medium text-gray-700">
                                        Hemostasis Performed
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="polypectomy"
                                        checked={formData.polypectomy}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, polypectomy: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="polypectomy" className="text-sm font-medium text-gray-700">
                                        Polypectomy Performed
                                    </label>
                                </div>
                            </div>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hemostasis Method</label>
                                <Input
                                    value={formData.hemostasisMethod}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, hemostasisMethod: e.target.value }))}
                                    placeholder="Method used for hemostasis"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Input
                                label="Biopsies Taken"
                                type="number"
                                value={formData.biopsiesTaken}
                                onChange={(e) => setFormData((prev) => ({ ...prev, biopsiesTaken: e.target.value }))}
                                placeholder="Number of biopsies"
                            />
                            <Input
                                label="Biopsy Sites"
                                value={formData.biopsySites}
                                onChange={(e) => setFormData((prev) => ({ ...prev, biopsySites: e.target.value }))}
                                placeholder="Sites where biopsies were taken"
                            />
                            <Input
                                label="Polyps Removed"
                                type="number"
                                value={formData.polypsRemoved}
                                onChange={(e) => setFormData((prev) => ({ ...prev, polypsRemoved: e.target.value }))}
                                placeholder="Number of polyps removed"
                            />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Polyp Size (mm)"
                                type="number"
                                value={formData.polypSizeMm}
                                onChange={(e) => setFormData((prev) => ({ ...prev, polypSizeMm: e.target.value }))}
                                placeholder="Size of largest polyp in mm"
                            />
                            <Input
                                label="Follow-up Interval"
                                value={formData.followUpInterval}
                                onChange={(e) => setFormData((prev) => ({ ...prev, followUpInterval: e.target.value }))}
                                placeholder="e.g., 1 year, 6 months"
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
                                {isEditMode ? 'Update Endoscopy' : 'Create Endoscopy'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
