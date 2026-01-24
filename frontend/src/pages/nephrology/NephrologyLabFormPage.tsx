import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { nephrologyLabService } from '../../services/nephrology-lab.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateNephrologyLabResultRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { NephrologyNav } from './NephrologyNav';

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type LabFormState = {
    patientId: string;
    collectedAt: string;
    creatinine: string;
    bun: string;
    egfr: string;
    potassium: string;
    sodium: string;
    chloride: string;
    bicarbonate: string;
    calcium: string;
    phosphorus: string;
    albumin: string;
    hemoglobin: string;
    pth: string;
    vitaminD: string;
    uricAcid: string;
    urineProtein: string;
    urineAlbumin: string;
    urineCreatinine: string;
    uacr: string;
    upcr: string;
    notes: string;
};

export function NephrologyLabFormPage() {
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
        creatinine: '',
        bun: '',
        egfr: '',
        potassium: '',
        sodium: '',
        chloride: '',
        bicarbonate: '',
        calcium: '',
        phosphorus: '',
        albumin: '',
        hemoglobin: '',
        pth: '',
        vitaminD: '',
        uricAcid: '',
        urineProtein: '',
        urineAlbumin: '',
        urineCreatinine: '',
        uacr: '',
        upcr: '',
        notes: '',
    });

    const { data: result, isLoading } = useQuery({
        queryKey: ['nephrology-lab', id],
        queryFn: () => nephrologyLabService.getResult(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'nephrology-lab', patientSearch],
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
            creatinine: result.creatinine?.toString() || '',
            bun: result.bun?.toString() || '',
            egfr: result.egfr?.toString() || '',
            potassium: result.potassium?.toString() || '',
            sodium: result.sodium?.toString() || '',
            chloride: result.chloride?.toString() || '',
            bicarbonate: result.bicarbonate?.toString() || '',
            calcium: result.calcium?.toString() || '',
            phosphorus: result.phosphorus?.toString() || '',
            albumin: result.albumin?.toString() || '',
            hemoglobin: result.hemoglobin?.toString() || '',
            pth: result.pth?.toString() || '',
            vitaminD: result.vitaminD?.toString() || '',
            uricAcid: result.uricAcid?.toString() || '',
            urineProtein: result.urineProtein?.toString() || '',
            urineAlbumin: result.urineAlbumin?.toString() || '',
            urineCreatinine: result.urineCreatinine?.toString() || '',
            uacr: result.uacr?.toString() || '',
            upcr: result.upcr?.toString() || '',
            notes: result.notes || '',
        });
        if (result.patient) {
            setPatientInput(`${result.patient.firstName} ${result.patient.lastName}`);
        } else {
            setPatientInput(result.patientId);
        }
    }, [result]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateNephrologyLabResultRequest) => nephrologyLabService.createResult(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-labs'] });
            navigate('/nephrology/labs');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateNephrologyLabResultRequest) => nephrologyLabService.updateResult(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['nephrology-labs'] });
            queryClient.invalidateQueries({ queryKey: ['nephrology-lab', id] });
            navigate('/nephrology/labs');
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

        const payload: CreateNephrologyLabResultRequest = {
            patientId: formData.patientId,
            collectedAt: formData.collectedAt,
            creatinine: toNumber(formData.creatinine),
            bun: toNumber(formData.bun),
            egfr: toNumber(formData.egfr),
            potassium: toNumber(formData.potassium),
            sodium: toNumber(formData.sodium),
            chloride: toNumber(formData.chloride),
            bicarbonate: toNumber(formData.bicarbonate),
            calcium: toNumber(formData.calcium),
            phosphorus: toNumber(formData.phosphorus),
            albumin: toNumber(formData.albumin),
            hemoglobin: toNumber(formData.hemoglobin),
            pth: toNumber(formData.pth),
            vitaminD: toNumber(formData.vitaminD),
            uricAcid: toNumber(formData.uricAcid),
            urineProtein: toNumber(formData.urineProtein),
            urineAlbumin: toNumber(formData.urineAlbumin),
            urineCreatinine: toNumber(formData.urineCreatinine),
            uacr: toNumber(formData.uacr),
            upcr: toNumber(formData.upcr),
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (isEditMode && !result) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Lab result not found</p>
                <Link to="/nephrology/labs" className="text-emerald-600 hover:underline mt-2 inline-block">
                    Back to labs
                </Link>
            </div>
        );
    }

    const patients = patientsData?.patients ?? [];
    const patientOptions: SelectOption[] = patients.map((patient) => ({
        id: patient.id,
        label: `${patient.firstName} ${patient.lastName}`,
        subLabel: `MRN ${patient.mrn}${patient.phone ? ` | ${patient.phone}` : ''}`,
    }));

    const isSaving = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="w-full max-w-5xl mx-auto space-y-6 lg:pl-0">
            <div className="flex items-center gap-4 pt-2 lg:pt-0">
                <Link to="/nephrology/labs">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft size={18} className="mr-2" />
                        Back
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">
                    {isEditMode ? 'Edit Lab Result' : 'New Lab Result'}
                </h1>
            </div>

            <NephrologyNav />

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Collection</CardTitle>
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
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Metabolic Panel</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Creatinine"
                                type="number"
                                step="0.01"
                                value={formData.creatinine}
                                onChange={(e) => setFormData((prev) => ({ ...prev, creatinine: e.target.value }))}
                            />
                            <Input
                                label="BUN"
                                type="number"
                                step="0.1"
                                value={formData.bun}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bun: e.target.value }))}
                            />
                            <Input
                                label="eGFR"
                                type="number"
                                step="0.1"
                                value={formData.egfr}
                                onChange={(e) => setFormData((prev) => ({ ...prev, egfr: e.target.value }))}
                            />
                            <Input
                                label="Sodium"
                                type="number"
                                step="0.1"
                                value={formData.sodium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sodium: e.target.value }))}
                            />
                            <Input
                                label="Potassium"
                                type="number"
                                step="0.1"
                                value={formData.potassium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, potassium: e.target.value }))}
                            />
                            <Input
                                label="Chloride"
                                type="number"
                                step="0.1"
                                value={formData.chloride}
                                onChange={(e) => setFormData((prev) => ({ ...prev, chloride: e.target.value }))}
                            />
                            <Input
                                label="Bicarbonate"
                                type="number"
                                step="0.1"
                                value={formData.bicarbonate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, bicarbonate: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mineral & Bone</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Calcium"
                                type="number"
                                step="0.1"
                                value={formData.calcium}
                                onChange={(e) => setFormData((prev) => ({ ...prev, calcium: e.target.value }))}
                            />
                            <Input
                                label="Phosphorus"
                                type="number"
                                step="0.1"
                                value={formData.phosphorus}
                                onChange={(e) => setFormData((prev) => ({ ...prev, phosphorus: e.target.value }))}
                            />
                            <Input
                                label="Albumin"
                                type="number"
                                step="0.1"
                                value={formData.albumin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, albumin: e.target.value }))}
                            />
                            <Input
                                label="PTH"
                                type="number"
                                step="0.1"
                                value={formData.pth}
                                onChange={(e) => setFormData((prev) => ({ ...prev, pth: e.target.value }))}
                            />
                            <Input
                                label="Vitamin D"
                                type="number"
                                step="0.1"
                                value={formData.vitaminD}
                                onChange={(e) => setFormData((prev) => ({ ...prev, vitaminD: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hematology & Other</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Hemoglobin"
                                type="number"
                                step="0.1"
                                value={formData.hemoglobin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, hemoglobin: e.target.value }))}
                            />
                            <Input
                                label="Uric Acid"
                                type="number"
                                step="0.1"
                                value={formData.uricAcid}
                                onChange={(e) => setFormData((prev) => ({ ...prev, uricAcid: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Urine Studies</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                label="Urine Protein"
                                type="number"
                                step="0.1"
                                value={formData.urineProtein}
                                onChange={(e) => setFormData((prev) => ({ ...prev, urineProtein: e.target.value }))}
                            />
                            <Input
                                label="Urine Albumin"
                                type="number"
                                step="0.1"
                                value={formData.urineAlbumin}
                                onChange={(e) => setFormData((prev) => ({ ...prev, urineAlbumin: e.target.value }))}
                            />
                            <Input
                                label="Urine Creatinine"
                                type="number"
                                step="0.1"
                                value={formData.urineCreatinine}
                                onChange={(e) => setFormData((prev) => ({ ...prev, urineCreatinine: e.target.value }))}
                            />
                            <Input
                                label="UACR"
                                type="number"
                                step="0.1"
                                value={formData.uacr}
                                onChange={(e) => setFormData((prev) => ({ ...prev, uacr: e.target.value }))}
                            />
                            <Input
                                label="UPCR"
                                type="number"
                                step="0.1"
                                value={formData.upcr}
                                onChange={(e) => setFormData((prev) => ({ ...prev, upcr: e.target.value }))}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Input
                            label="Notes"
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Additional notes"
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                        <Save size={18} className="mr-2" />
                        {isEditMode ? 'Update Lab Result' : 'Create Lab Result'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
