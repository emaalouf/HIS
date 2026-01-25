import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { admissionService } from '../../services/admission.service';
import { wardService } from '../../services/ward.service';
import { bedService } from '../../services/bed.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { AdmissionStatus, CreateAdmissionRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { AdmissionsNav } from './AdmissionsNav';

const statusOptions: AdmissionStatus[] = [
    'ADMITTED',
    'TRANSFERRED',
    'DISCHARGED',
    'CANCELLED',
];

type AdmissionFormState = {
    patientId: string;
    providerId: string;
    wardId: string;
    bedId: string;
    departmentId: string;
    status: AdmissionStatus;
    admitDate: string;
    dischargeDate: string;
    reason: string;
    diagnosis: string;
    notes: string;
};

export function AdmissionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');
    const [wardInput, setWardInput] = useState('');
    const [bedInput, setBedInput] = useState('');

    const defaultAdmitDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

    const [formData, setFormData] = useState<AdmissionFormState>({
        patientId: '',
        providerId: '',
        wardId: '',
        bedId: '',
        departmentId: '',
        status: 'ADMITTED',
        admitDate: defaultAdmitDate,
        dischargeDate: '',
        reason: '',
        diagnosis: '',
        notes: '',
    });

    const { data: admission, isLoading } = useQuery({
        queryKey: ['admission', id],
        queryFn: () => admissionService.getAdmission(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();
    const wardSearch = wardInput.trim();
    const bedSearch = bedInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'admission-picker', patientSearch],
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
        queryKey: ['providers', 'admission-picker', providerSearch],
        queryFn: () =>
            providerService.getProviders({
                page: 1,
                limit: 10,
                search: providerSearch || undefined,
                sortBy: providerSearch ? undefined : 'createdAt',
                sortOrder: providerSearch ? undefined : 'desc',
            }),
    });

    const { data: wardsData, isLoading: isWardsLoading } = useQuery({
        queryKey: ['wards', 'admission-picker', wardSearch],
        queryFn: () =>
            wardService.getWards({
                page: 1,
                limit: 10,
                search: wardSearch || undefined,
            }),
    });

    const { data: bedsData, isLoading: isBedsLoading } = useQuery({
        queryKey: ['beds', 'admission-picker', bedSearch, formData.wardId],
        queryFn: () =>
            bedService.getBeds({
                page: 1,
                limit: 10,
                search: bedSearch || undefined,
                wardId: formData.wardId || undefined,
            }),
    });

    useEffect(() => {
        if (!admission) return;
        setFormData({
            patientId: admission.patientId,
            providerId: admission.providerId,
            wardId: admission.wardId || '',
            bedId: admission.bedId || '',
            departmentId: admission.departmentId || '',
            status: admission.status,
            admitDate: admission.admitDate.slice(0, 10),
            dischargeDate: admission.dischargeDate ? admission.dischargeDate.slice(0, 10) : '',
            reason: admission.reason || '',
            diagnosis: admission.diagnosis || '',
            notes: admission.notes || '',
        });
        if (admission.patient) {
            setPatientInput(`${admission.patient.firstName} ${admission.patient.lastName}`);
        } else {
            setPatientInput(admission.patientId);
        }
        if (admission.provider) {
            const prefix = admission.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${admission.provider.firstName} ${admission.provider.lastName}`);
        } else {
            setProviderInput(admission.providerId);
        }
        if (admission.ward) {
            setWardInput(admission.ward.name);
        } else if (admission.wardId) {
            setWardInput(admission.wardId);
        }
        if (admission.bed) {
            setBedInput(admission.bed.bedLabel);
        } else if (admission.bedId) {
            setBedInput(admission.bedId);
        }
    }, [admission]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateAdmissionRequest) => admissionService.createAdmission(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            navigate('/admissions');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateAdmissionRequest) => admissionService.updateAdmission(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions'] });
            queryClient.invalidateQueries({ queryKey: ['admission', id] });
            navigate('/admissions');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

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
        if (!formData.admitDate) {
            setError('Please provide an admit date.');
            return;
        }

        const payload: CreateAdmissionRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            wardId: formData.wardId || undefined,
            bedId: formData.bedId || undefined,
            departmentId: formData.departmentId || undefined,
            status: formData.status,
            admitDate: formData.admitDate,
            dischargeDate: formData.dischargeDate || undefined,
            reason: formData.reason || undefined,
            diagnosis: formData.diagnosis || undefined,
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

    const wardOptions: SelectOption[] = (wardsData?.wards || []).map((ward) => ({
        id: ward.id,
        label: ward.name,
        subLabel: ward.department?.name || ward.departmentId || undefined,
    }));

    const beds = bedsData?.beds || [];
    const bedsById = new Map(beds.map((bed) => [bed.id, bed]));
    const bedOptions: SelectOption[] = beds.map((bed) => ({
        id: bed.id,
        label: bed.bedLabel,
        subLabel: bed.roomNumber ? `Room ${bed.roomNumber}` : undefined,
    }));

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !admission) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Admission not found</p>
                <Link to="/admissions" className="text-blue-600 hover:underline mt-2 inline-block">
                    Back to admissions
                </Link>
            </div>
        );
    }

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/admissions">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Admission' : 'New Admission'}
                </h1>
            </div>

            <AdmissionsNav />

            {error && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4">
                        <p className="text-red-700 text-sm">{error}</p>
                    </CardContent>
                </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Admission Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Patient"
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                placeholder="Search patients"
                                onInputChange={setPatientInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <SearchableSelect
                                label="Admitting Provider"
                                value={providerInput}
                                required
                                options={providerOptions}
                                selectedId={formData.providerId}
                                isLoading={isProvidersLoading}
                                placeholder="Search providers"
                                onInputChange={setProviderInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, providerId: option.id }));
                                    setProviderInput(option.label);
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Admit Date"
                                type="date"
                                value={formData.admitDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, admitDate: e.target.value }))}
                            />
                            <Input
                                label="Discharge Date"
                                type="date"
                                value={formData.dischargeDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, dischargeDate: e.target.value }))}
                            />
                            <div className="w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, status: e.target.value as AdmissionStatus }))
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Ward (optional)"
                                value={wardInput}
                                options={wardOptions}
                                selectedId={formData.wardId}
                                isLoading={isWardsLoading}
                                placeholder="Search wards"
                                onInputChange={setWardInput}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, wardId: option.id, bedId: '' }));
                                    setWardInput(option.label);
                                    setBedInput('');
                                }}
                            />
                            <SearchableSelect
                                label="Bed (optional)"
                                value={bedInput}
                                options={bedOptions}
                                selectedId={formData.bedId}
                                isLoading={isBedsLoading}
                                placeholder="Search beds"
                                onInputChange={setBedInput}
                                onSelect={(option) => {
                                    const selectedBed = bedsById.get(option.id);
                                    setFormData((prev) => ({
                                        ...prev,
                                        bedId: option.id,
                                        wardId: prev.wardId || selectedBed?.wardId || '',
                                    }));
                                    setBedInput(option.label);
                                    if (!formData.wardId && selectedBed?.ward) {
                                        setWardInput(selectedBed.ward.name);
                                    }
                                }}
                            />
                        </div>
                        <Input
                            label="Department ID"
                            value={formData.departmentId}
                            onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                            placeholder="Optional department ID"
                        />
                        <Input
                            label="Reason for Admission"
                            value={formData.reason}
                            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                            placeholder="Optional"
                        />
                        <Input
                            label="Diagnosis"
                            value={formData.diagnosis}
                            onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                            placeholder="Optional"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            rows={4}
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Admission' : 'Save Admission'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
