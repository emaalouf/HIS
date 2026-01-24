import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { dialysisLabService } from '../../services/dialysis-lab.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateDialysisLabResultRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { DialysisNav } from './DialysisNav';

type LabFormState = {
    patientId: string;
    collectedAt: string;
    ktv: string;
    urr: string;
    hemoglobin: string;
    potassium: string;
    sodium: string;
    calcium: string;
    phosphorus: string;
    bicarbonate: string;
    albumin: string;
    creatinine: string;
    notes: string;
};

export function DialysisLabFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');

    const [formData, setFormData] = useState<LabFormState>({
        patientId: '',
        collectedAt: '',
        ktv: '',
        urr: '',
        hemoglobin: '',
        potassium: '',
        sodium: '',
        calcium: '',
        phosphorus: '',
        bicarbonate: '',
        albumin: '',
        creatinine: '',
        notes: '',
    });

    const { data: result, isLoading } = useQuery({
        queryKey: ['dialysis-lab', id],
        queryFn: () => dialysisLabService.getResult(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'dialysis-lab', patientSearch],
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
            collectedAt: result.collectedAt.slice(0, 10),
            ktv: result.ktv?.toString() || '',
            urr: result.urr?.toString() || '',
            hemoglobin: result.hemoglobin?.toString() || '',
            potassium: result.potassium?.toString() || '',
            sodium: result.sodium?.toString() || '',
            calcium: result.calcium?.toString() || '',
            phosphorus: result.phosphorus?.toString() || '',
            bicarbonate: result.bicarbonate?.toString() || '',
            albumin: result.albumin?.toString() || '',
            creatinine: result.creatinine?.toString() || '',
            notes: result.notes || '',
        });
        if (result.patient) {
            setPatientInput(`${result.patient.firstName} ${result.patient.lastName}`);
        } else {
            setPatientInput(result.patientId);
        }
    }, [result]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateDialysisLabResultRequest) => dialysisLabService.createResult(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-labs'] });
            navigate('/dialysis/labs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateDialysisLabResultRequest) => dialysisLabService.updateResult(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dialysis-labs'] });
            queryClient.invalidateQueries({ queryKey: ['dialysis-lab', id] });
            navigate('/dialysis/labs');
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
        if (!formData.collectedAt) {
            setError('Please select a collection date.');
            return;
        }

        const payload: CreateDialysisLabResultRequest = {
            patientId: formData.patientId,
            collectedAt: formData.collectedAt,
            ktv: toNumber(formData.ktv),
            urr: toNumber(formData.urr),
            hemoglobin: toNumber(formData.hemoglobin),
            potassium: toNumber(formData.potassium),
            sodium: toNumber(formData.sodium),
            calcium: toNumber(formData.calcium),
            phosphorus: toNumber(formData.phosphorus),
            bicarbonate: toNumber(formData.bicarbonate),
            albumin: toNumber(formData.albumin),
            creatinine: toNumber(formData.creatinine),
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isEditMode && !result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Lab result not found</p>
                <Link to="/dialysis/labs" className="text-blue-600 hover:underline mt-2 inline-block">
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

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/dialysis/labs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Lab Result' : 'New Lab Result'}
                </h1>
            </div>

            <DialysisNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Lab Details</CardTitle>
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
                                    setPatientInput(option.label);
                                    setFormData((prev) => ({ ...prev, patientId: option.id }));
                                }}
                            />
                            <Input
                                label="Collected At *"
                                type="date"
                                name="collectedAt"
                                value={formData.collectedAt}
                                onChange={(e) => setFormData((prev) => ({ ...prev, collectedAt: e.target.value }))}
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Adequacy</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Kt/V"
                                type="number"
                                step="0.01"
                                name="ktv"
                                value={formData.ktv}
                                onChange={(e) => setFormData((prev) => ({ ...prev, ktv: e.target.value }))}
                            />
                            <Input
                                label="URR"
                                type="number"
                                step="0.1"
                                name="urr"
                                value={formData.urr}
                                onChange={(e) => setFormData((prev) => ({ ...prev, urr: e.target.value }))}
                            />
                            <Input
                                label="Hemoglobin"
                                type="number"
                                step="0.1"
                                name="hemoglobin"
                                value={formData.hemoglobin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, hemoglobin: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Electrolytes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Potassium"
                                type="number"
                                step="0.1"
                                name="potassium"
                                value={formData.potassium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, potassium: e.target.value }))}
                            />
                            <Input
                                label="Sodium"
                                type="number"
                                step="0.1"
                                name="sodium"
                                value={formData.sodium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sodium: e.target.value }))}
                            />
                            <Input
                                label="Calcium"
                                type="number"
                                step="0.1"
                                name="calcium"
                                value={formData.calcium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, calcium: e.target.value }))}
                            />
                            <Input
                                label="Phosphorus"
                                type="number"
                                step="0.1"
                                name="phosphorus"
                                value={formData.phosphorus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phosphorus: e.target.value }))}
                            />
                            <Input
                                label="Bicarbonate"
                                type="number"
                                step="0.1"
                                name="bicarbonate"
                                value={formData.bicarbonate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bicarbonate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Nutrition & Renal</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Albumin"
                                type="number"
                                step="0.1"
                                name="albumin"
                                value={formData.albumin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, albumin: e.target.value }))}
                            />
                            <Input
                                label="Creatinine"
                                type="number"
                                step="0.1"
                                name="creatinine"
                                value={formData.creatinine}
                                onChange={(e) => setFormData((prev) => ({ ...prev, creatinine: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="Optional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" size="lg" isLoading={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Lab Result' : 'Save Lab Result'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
