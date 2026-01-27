import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gastroLiverFunctionService } from '../../services/gastro-liver-function.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { CreateGastroLiverFunctionRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';

import { GastroNav } from './GastroNav';

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type LiverFunctionFormState = {
    patientId: string;
    testDate: string;
    alt: string;
    ast: string;
    alp: string;
    ggt: string;
    totalBilirubin: string;
    directBilirubin: string;
    indirectBilirubin: string;
    totalProtein: string;
    albumin: string;
    globulin: string;
    agRatio: string;
    pt: string;
    inr: string;
    ptt: string;
    fibroscanScore: string;
    fibrosisStage: string;
    steatosisGrade: string;
    capScore: string;
    diagnosis: string;
    interpretation: string;
    notes: string;
};

export function GastroLiverFunctionFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');

    const defaultTestDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<LiverFunctionFormState>({
        patientId: '',
        testDate: defaultTestDate,
        alt: '',
        ast: '',
        alp: '',
        ggt: '',
        totalBilirubin: '',
        directBilirubin: '',
        indirectBilirubin: '',
        totalProtein: '',
        albumin: '',
        globulin: '',
        agRatio: '',
        pt: '',
        inr: '',
        ptt: '',
        fibroscanScore: '',
        fibrosisStage: '',
        steatosisGrade: '',
        capScore: '',
        diagnosis: '',
        interpretation: '',
        notes: '',
    });

    const { data: liverFunction, isLoading } = useQuery({
        queryKey: ['gastro-liver-function', id],
        queryFn: () => gastroLiverFunctionService.getLiverFunction(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'gastro-liver-function-picker', patientSearch],
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
        if (!liverFunction) return;
        setFormData({
            patientId: liverFunction.patientId,
            testDate: formatDateTimeLocal(new Date(liverFunction.testDate)),
            alt: liverFunction.alt?.toString() || '',
            ast: liverFunction.ast?.toString() || '',
            alp: liverFunction.alp?.toString() || '',
            ggt: liverFunction.ggt?.toString() || '',
            totalBilirubin: liverFunction.totalBilirubin?.toString() || '',
            directBilirubin: liverFunction.directBilirubin?.toString() || '',
            indirectBilirubin: liverFunction.indirectBilirubin?.toString() || '',
            totalProtein: liverFunction.totalProtein?.toString() || '',
            albumin: liverFunction.albumin?.toString() || '',
            globulin: liverFunction.globulin?.toString() || '',
            agRatio: liverFunction.agRatio?.toString() || '',
            pt: liverFunction.pt?.toString() || '',
            inr: liverFunction.inr?.toString() || '',
            ptt: liverFunction.ptt?.toString() || '',
            fibroscanScore: liverFunction.fibroscanScore?.toString() || '',
            fibrosisStage: liverFunction.fibrosisStage || '',
            steatosisGrade: liverFunction.steatosisGrade || '',
            capScore: liverFunction.capScore?.toString() || '',
            diagnosis: liverFunction.diagnosis || '',
            interpretation: liverFunction.interpretation || '',
            notes: liverFunction.notes || '',
        });
        if (liverFunction.patient) {
            setPatientInput(`${liverFunction.patient.firstName} ${liverFunction.patient.lastName}`);
        } else {
            setPatientInput(liverFunction.patientId);
        }
    }, [liverFunction]);

    const createMutation = useMutation({
        mutationFn: (payload: CreateGastroLiverFunctionRequest) => gastroLiverFunctionService.createLiverFunction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-liver-functions'] });
            navigate('/gastroenterology/liver-function');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreateGastroLiverFunctionRequest) => gastroLiverFunctionService.updateLiverFunction(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gastro-liver-functions'] });
            queryClient.invalidateQueries({ queryKey: ['gastro-liver-function', id] });
            navigate('/gastroenterology/liver-function');
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

        const payload: CreateGastroLiverFunctionRequest = {
            patientId: formData.patientId,
            testDate: formData.testDate,
            alt: toNumber(formData.alt),
            ast: toNumber(formData.ast),
            alp: toNumber(formData.alp),
            ggt: toNumber(formData.ggt),
            totalBilirubin: toNumber(formData.totalBilirubin),
            directBilirubin: toNumber(formData.directBilirubin),
            indirectBilirubin: toNumber(formData.indirectBilirubin),
            totalProtein: toNumber(formData.totalProtein),
            albumin: toNumber(formData.albumin),
            globulin: toNumber(formData.globulin),
            agRatio: toNumber(formData.agRatio),
            pt: toNumber(formData.pt),
            inr: toNumber(formData.inr),
            ptt: toNumber(formData.ptt),
            fibroscanScore: toNumber(formData.fibroscanScore),
            fibrosisStage: formData.fibrosisStage || undefined,
            steatosisGrade: formData.steatosisGrade || undefined,
            capScore: toNumber(formData.capScore),
            diagnosis: formData.diagnosis || undefined,
            interpretation: formData.interpretation || undefined,
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
                        {isEditMode ? 'Edit Liver Function Test' : 'New Liver Function Test'}
                    </h1>
                    <p className="text-gray-500 mt-1">Record liver function test results and interpretation.</p>
                </div>
                <Link to="/gastroenterology/liver-function">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Liver Function Tests
                    </Button>
                </Link>
            </div>

            <GastroNav />

            <Card>
                <CardHeader>
                    <CardTitle>Liver Function Test Details</CardTitle>
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
                            <Input
                                label="Test Date"
                                type="datetime-local"
                                value={formData.testDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, testDate: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Liver Enzymes</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <Input
                                    label="ALT (U/L)"
                                    type="number"
                                    step="0.1"
                                    value={formData.alt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, alt: e.target.value }))}
                                    placeholder="Alanine transaminase"
                                />
                                <Input
                                    label="AST (U/L)"
                                    type="number"
                                    step="0.1"
                                    value={formData.ast}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, ast: e.target.value }))}
                                    placeholder="Aspartate transaminase"
                                />
                                <Input
                                    label="ALP (U/L)"
                                    type="number"
                                    step="0.1"
                                    value={formData.alp}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, alp: e.target.value }))}
                                    placeholder="Alkaline phosphatase"
                                />
                                <Input
                                    label="GGT (U/L)"
                                    type="number"
                                    step="0.1"
                                    value={formData.ggt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, ggt: e.target.value }))}
                                    placeholder="Gamma-glutamyl transferase"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Bilirubin</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Input
                                    label="Total Bilirubin (mg/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.totalBilirubin}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, totalBilirubin: e.target.value }))}
                                    placeholder="Total bilirubin level"
                                />
                                <Input
                                    label="Direct Bilirubin (mg/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.directBilirubin}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, directBilirubin: e.target.value }))}
                                    placeholder="Conjugated bilirubin"
                                />
                                <Input
                                    label="Indirect Bilirubin (mg/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.indirectBilirubin}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, indirectBilirubin: e.target.value }))}
                                    placeholder="Unconjugated bilirubin"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Proteins</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <Input
                                    label="Total Protein (g/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.totalProtein}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, totalProtein: e.target.value }))}
                                    placeholder="Total protein level"
                                />
                                <Input
                                    label="Albumin (g/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.albumin}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, albumin: e.target.value }))}
                                    placeholder="Albumin level"
                                />
                                <Input
                                    label="Globulin (g/dL)"
                                    type="number"
                                    step="0.1"
                                    value={formData.globulin}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, globulin: e.target.value }))}
                                    placeholder="Globulin level"
                                />
                                <Input
                                    label="A/G Ratio"
                                    type="number"
                                    step="0.1"
                                    value={formData.agRatio}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, agRatio: e.target.value }))}
                                    placeholder="Albumin/Globulin ratio"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Coagulation</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Input
                                    label="PT (seconds)"
                                    type="number"
                                    step="0.1"
                                    value={formData.pt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, pt: e.target.value }))}
                                    placeholder="Prothrombin time"
                                />
                                <Input
                                    label="INR"
                                    type="number"
                                    step="0.01"
                                    value={formData.inr}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, inr: e.target.value }))}
                                    placeholder="International normalized ratio"
                                />
                                <Input
                                    label="PTT (seconds)"
                                    type="number"
                                    step="0.1"
                                    value={formData.ptt}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, ptt: e.target.value }))}
                                    placeholder="Partial thromboplastin time"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Fibroscan / Elastography</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <Input
                                    label="Fibroscan Score (kPa)"
                                    type="number"
                                    step="0.1"
                                    value={formData.fibroscanScore}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, fibroscanScore: e.target.value }))}
                                    placeholder="Liver stiffness measurement"
                                />
                                <Input
                                    label="Fibrosis Stage"
                                    value={formData.fibrosisStage}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, fibrosisStage: e.target.value }))}
                                    placeholder="e.g., F0, F1, F2, F3, F4"
                                />
                                <Input
                                    label="Steatosis Grade"
                                    value={formData.steatosisGrade}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, steatosisGrade: e.target.value }))}
                                    placeholder="e.g., S0, S1, S2, S3"
                                />
                                <Input
                                    label="CAP Score (dB/m)"
                                    type="number"
                                    step="1"
                                    value={formData.capScore}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, capScore: e.target.value }))}
                                    placeholder="Controlled attenuation parameter"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Interpretation</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Diagnosis"
                                    value={formData.diagnosis}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, diagnosis: e.target.value }))}
                                    placeholder="Primary diagnosis based on test results"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interpretation</label>
                                <textarea
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm min-h-[100px]"
                                    value={formData.interpretation}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, interpretation: e.target.value }))}
                                    placeholder="Detailed interpretation of liver function test results"
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
                                {isEditMode ? 'Update Liver Function Test' : 'Create Liver Function Test'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
