import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardiologyLabService } from '../../services/cardiology-lab.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateCardiologyLabResultRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { CardiologyNav } from './CardiologyNav';

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type LabFormState = {
    patientId: string;
    collectedAt: string;
    troponin: string;
    bnp: string;
    ntProBnp: string;
    ckmb: string;
    totalCholesterol: string;
    ldl: string;
    hdl: string;
    triglycerides: string;
    crp: string;
    inr: string;
    notes: string;
};

export function CardiologyLabFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');

    const defaultCollectedAt = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<LabFormState>({
        patientId: '',
        collectedAt: defaultCollectedAt,
        troponin: '',
        bnp: '',
        ntProBnp: '',
        ckmb: '',
        totalCholesterol: '',
        ldl: '',
        hdl: '',
        triglycerides: '',
        crp: '',
        inr: '',
        notes: '',
    });

    const { data: result, isLoading } = useQuery({
        queryKey: ['cardiology-lab', id],
        queryFn: () => cardiologyLabService.getResult(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'cardiology-lab', patientSearch],
        queryFn: () =>
            patientService.getPatients({
                page: 1,
                limit: 10,
                search: patientSearch || undefined,
                sortBy: patientSearch ? undefined : 'createdAt',
                sortOrder: patientSearch ? undefined : 'desc',
            }),
    });

    useEffect(() => {
        if (!result) return;
        setFormData({
            patientId: result.patientId,
            collectedAt: formatDateTimeLocal(new Date(result.collectedAt)),
            troponin: result.troponin?.toString() || '',
            bnp: result.bnp?.toString() || '',
            ntProBnp: result.ntProBnp?.toString() || '',
            ckmb: result.ckmb?.toString() || '',
            totalCholesterol: result.totalCholesterol?.toString() || '',
            ldl: result.ldl?.toString() || '',
            hdl: result.hdl?.toString() || '',
            triglycerides: result.triglycerides?.toString() || '',
            crp: result.crp?.toString() || '',
            inr: result.inr?.toString() || '',
            notes: result.notes || '',
        });
        if (result.patient) {
            setPatientInput(`${result.patient.firstName} ${result.patient.lastName}`);
        } else {
            setPatientInput(result.patientId);
        }
    }, [result]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateCardiologyLabResultRequest) => cardiologyLabService.createResult(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-labs'] });
            navigate('/cardiology/labs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateCardiologyLabResultRequest) => cardiologyLabService.updateResult(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cardiology-labs'] });
            queryClient.invalidateQueries({ queryKey: ['cardiology-lab', id] });
            navigate('/cardiology/labs');
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

        const payload: CreateCardiologyLabResultRequest = {
            patientId: formData.patientId,
            collectedAt: formData.collectedAt,
            troponin: toNumber(formData.troponin),
            bnp: toNumber(formData.bnp),
            ntProBnp: toNumber(formData.ntProBnp),
            ckmb: toNumber(formData.ckmb),
            totalCholesterol: toNumber(formData.totalCholesterol),
            ldl: toNumber(formData.ldl),
            hdl: toNumber(formData.hdl),
            triglycerides: toNumber(formData.triglycerides),
            crp: toNumber(formData.crp),
            inr: toNumber(formData.inr),
            notes: formData.notes || undefined,
        };

        if (isEditMode) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isEditMode && isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    if (isEditMode && !result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Lab result not found</p>
                <Link to="/cardiology/labs" className="text-rose-600 hover:underline mt-2 inline-block">
                    Back to labs
                </Link>
            </div>
        );
    }

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` • ${patient.phone}` : ''}`,
    }));

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/cardiology/labs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Lab Result' : 'New Lab Result'}
                </h1>
            </div>

            <CardiologyNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Lab Result Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SearchableSelect
                                label="Patient *"
                                placeholder="Search patients..."
                                value={patientInput}
                                required
                                options={patientOptions}
                                selectedId={formData.patientId}
                                isLoading={isPatientsLoading}
                                onInputChange={(value) => {
                                    setPatientInput(value);
                                    setFormData((prev) => ({ ...prev, patientId: '' }));
                                }}
                                onSelect={(option) => {
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                    setPatientInput(option.label);
                                }}
                            />
                            <Input
                                label="Collected At"
                                type="datetime-local"
                                value={formData.collectedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, collectedAt: e.target.value }))}
                                required
                            />
                            <Input
                                label="Troponin"
                                value={formData.troponin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, troponin: e.target.value }))}
                            />
                            <Input
                                label="BNP"
                                value={formData.bnp}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bnp: e.target.value }))}
                            />
                            <Input
                                label="NT-proBNP"
                                value={formData.ntProBnp}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ntProBnp: e.target.value }))}
                            />
                            <Input
                                label="CK-MB"
                                value={formData.ckmb}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ckmb: e.target.value }))}
                            />
                            <Input
                                label="Total Cholesterol"
                                value={formData.totalCholesterol}
                                onChange={(e) => setFormData((prev) => ({ ...prev, totalCholesterol: e.target.value }))}
                            />
                            <Input
                                label="LDL"
                                value={formData.ldl}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ldl: e.target.value }))}
                            />
                            <Input
                                label="HDL"
                                value={formData.hdl}
                                onChange={(e) => setFormData((prev) => ({ ...prev, hdl: e.target.value }))}
                            />
                            <Input
                                label="Triglycerides"
                                value={formData.triglycerides}
                                onChange={(e) => setFormData((prev) => ({ ...prev, triglycerides: e.target.value }))}
                            />
                            <Input
                                label="CRP"
                                value={formData.crp}
                                onChange={(e) => setFormData((prev) => ({ ...prev, crp: e.target.value }))}
                            />
                            <Input
                                label="INR"
                                value={formData.inr}
                                onChange={(e) => setFormData((prev) => ({ ...prev, inr: e.target.value }))}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            <Input
                                label="Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Lab Result' : 'Create Lab Result'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
