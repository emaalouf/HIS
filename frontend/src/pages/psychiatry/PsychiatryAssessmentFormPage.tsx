import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychiatryAssessmentService } from '../../services/psychiatry-assessment.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { AssessmentType, CreatePsychiatryAssessmentRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { PsychiatryNav } from './PsychiatryNav';

const assessmentTypeOptions: AssessmentType[] = [
    'INITIAL',
    'FOLLOW_UP',
    'CRISIS',
    'DISCHARGE',
    'ANNUAL',
    'PRE_ADMISSION',
    'FORENSIC',
];

const assessmentTypeLabels: Record<AssessmentType, string> = {
    INITIAL: 'Initial',
    FOLLOW_UP: 'Follow-up',
    CRISIS: 'Crisis',
    DISCHARGE: 'Discharge',
    ANNUAL: 'Annual',
    PRE_ADMISSION: 'Pre-admission',
    FORENSIC: 'Forensic',
};

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type AssessmentFormState = {
    patientId: string;
    providerId: string;
    assessmentDate: string;
    assessmentType: AssessmentType;
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastPsychiatricHistory: string;
    pastMedicalHistory: string;
    familyHistory: string;
    socialHistory: string;
    substanceUseHistory: string;
    currentMedications: string;
    allergies: string;
    reviewOfSystems: string;
    mentalStatusExam: string;
    appearance: string;
    behavior: string;
    speech: string;
    mood: string;
    affect: string;
    thoughtProcess: string;
    thoughtContent: string;
    perceptions: string;
    cognition: string;
    insight: string;
    judgment: string;
    phq9Score: string;
    gad7Score: string;
    mdqScore: string;
    pcptsdScore: string;
    c_ssrsScore: string;
    riskAssessment: string;
    suicidalIdeation: boolean;
    suicidalPlan: boolean;
    suicidalIntent: boolean;
    homicidalIdeation: boolean;
    selfHarmBehaviors: boolean;
    diagnosisPrimary: string;
    diagnosisSecondary: string;
    diagnosisCodes: string;
    formulation: string;
    plan: string;
    medicationsStarted: string;
    psychotherapyRecommended: boolean;
    therapyType: string;
    followUpInterval: string;
    urgentFollowUp: boolean;
    notes: string;
};

export function PsychiatryAssessmentFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultAssessmentDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<AssessmentFormState>({
        patientId: '',
        providerId: '',
        assessmentDate: defaultAssessmentDate,
        assessmentType: 'INITIAL',
        chiefComplaint: '',
        historyOfPresentIllness: '',
        pastPsychiatricHistory: '',
        pastMedicalHistory: '',
        familyHistory: '',
        socialHistory: '',
        substanceUseHistory: '',
        currentMedications: '',
        allergies: '',
        reviewOfSystems: '',
        mentalStatusExam: '',
        appearance: '',
        behavior: '',
        speech: '',
        mood: '',
        affect: '',
        thoughtProcess: '',
        thoughtContent: '',
        perceptions: '',
        cognition: '',
        insight: '',
        judgment: '',
        phq9Score: '',
        gad7Score: '',
        mdqScore: '',
        pcptsdScore: '',
        c_ssrsScore: '',
        riskAssessment: '',
        suicidalIdeation: false,
        suicidalPlan: false,
        suicidalIntent: false,
        homicidalIdeation: false,
        selfHarmBehaviors: false,
        diagnosisPrimary: '',
        diagnosisSecondary: '',
        diagnosisCodes: '',
        formulation: '',
        plan: '',
        medicationsStarted: '',
        psychotherapyRecommended: false,
        therapyType: '',
        followUpInterval: '',
        urgentFollowUp: false,
        notes: '',
    });

    const { data: assessment, isLoading } = useQuery({
        queryKey: ['psychiatry-assessment', id],
        queryFn: () => psychiatryAssessmentService.getAssessment(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'psychiatry-assessment-picker', patientSearch],
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
        queryKey: ['providers', 'psychiatry-assessment-picker', providerSearch],
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
        if (!assessment) return;
        setFormData({
            patientId: assessment.patientId,
            providerId: assessment.providerId,
            assessmentDate: formatDateTimeLocal(new Date(assessment.assessmentDate)),
            assessmentType: assessment.assessmentType,
            chiefComplaint: assessment.chiefComplaint || '',
            historyOfPresentIllness: assessment.historyOfPresentIllness || '',
            pastPsychiatricHistory: assessment.pastPsychiatricHistory || '',
            pastMedicalHistory: assessment.pastMedicalHistory || '',
            familyHistory: assessment.familyHistory || '',
            socialHistory: assessment.socialHistory || '',
            substanceUseHistory: assessment.substanceUseHistory || '',
            currentMedications: assessment.currentMedications || '',
            allergies: assessment.allergies || '',
            reviewOfSystems: assessment.reviewOfSystems || '',
            mentalStatusExam: assessment.mentalStatusExam || '',
            appearance: assessment.appearance || '',
            behavior: assessment.behavior || '',
            speech: assessment.speech || '',
            mood: assessment.mood || '',
            affect: assessment.affect || '',
            thoughtProcess: assessment.thoughtProcess || '',
            thoughtContent: assessment.thoughtContent || '',
            perceptions: assessment.perceptions || '',
            cognition: assessment.cognition || '',
            insight: assessment.insight || '',
            judgment: assessment.judgment || '',
            phq9Score: assessment.phq9Score?.toString() || '',
            gad7Score: assessment.gad7Score?.toString() || '',
            mdqScore: assessment.mdqScore?.toString() || '',
            pcptsdScore: assessment.pcptsdScore?.toString() || '',
            c_ssrsScore: assessment.c_ssrsScore?.toString() || '',
            riskAssessment: assessment.riskAssessment || '',
            suicidalIdeation: assessment.suicidalIdeation || false,
            suicidalPlan: assessment.suicidalPlan || false,
            suicidalIntent: assessment.suicidalIntent || false,
            homicidalIdeation: assessment.homicidalIdeation || false,
            selfHarmBehaviors: assessment.selfHarmBehaviors || false,
            diagnosisPrimary: assessment.diagnosisPrimary || '',
            diagnosisSecondary: assessment.diagnosisSecondary || '',
            diagnosisCodes: assessment.diagnosisCodes || '',
            formulation: assessment.formulation || '',
            plan: assessment.plan || '',
            medicationsStarted: assessment.medicationsStarted || '',
            psychotherapyRecommended: assessment.psychotherapyRecommended || false,
            therapyType: assessment.therapyType || '',
            followUpInterval: assessment.followUpInterval || '',
            urgentFollowUp: assessment.urgentFollowUp || false,
            notes: assessment.notes || '',
        });
        if (assessment.patient) {
            setPatientInput(`${assessment.patient.firstName} ${assessment.patient.lastName}`);
        } else {
            setPatientInput(assessment.patientId);
        }
        if (assessment.provider) {
            const prefix = assessment.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${assessment.provider.firstName} ${assessment.provider.lastName}`);
        } else if (assessment.providerId) {
            setProviderInput(assessment.providerId);
        }
    }, [assessment]);

    const createMutation = useMutation({
        mutationFn: (payload: CreatePsychiatryAssessmentRequest) => psychiatryAssessmentService.createAssessment(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-assessments'] });
            navigate('/psychiatry');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreatePsychiatryAssessmentRequest) => psychiatryAssessmentService.updateAssessment(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-assessments'] });
            queryClient.invalidateQueries({ queryKey: ['psychiatry-assessment', id] });
            navigate('/psychiatry');
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
        if (!formData.chiefComplaint.trim()) {
            setError('Chief complaint is required.');
            return;
        }

        const payload: CreatePsychiatryAssessmentRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            assessmentDate: formData.assessmentDate,
            assessmentType: formData.assessmentType,
            chiefComplaint: formData.chiefComplaint,
            historyOfPresentIllness: formData.historyOfPresentIllness || undefined,
            pastPsychiatricHistory: formData.pastPsychiatricHistory || undefined,
            pastMedicalHistory: formData.pastMedicalHistory || undefined,
            familyHistory: formData.familyHistory || undefined,
            socialHistory: formData.socialHistory || undefined,
            substanceUseHistory: formData.substanceUseHistory || undefined,
            currentMedications: formData.currentMedications || undefined,
            allergies: formData.allergies || undefined,
            reviewOfSystems: formData.reviewOfSystems || undefined,
            mentalStatusExam: formData.mentalStatusExam || undefined,
            appearance: formData.appearance || undefined,
            behavior: formData.behavior || undefined,
            speech: formData.speech || undefined,
            mood: formData.mood || undefined,
            affect: formData.affect || undefined,
            thoughtProcess: formData.thoughtProcess || undefined,
            thoughtContent: formData.thoughtContent || undefined,
            perceptions: formData.perceptions || undefined,
            cognition: formData.cognition || undefined,
            insight: formData.insight || undefined,
            judgment: formData.judgment || undefined,
            phq9Score: toNumber(formData.phq9Score),
            gad7Score: toNumber(formData.gad7Score),
            mdqScore: toNumber(formData.mdqScore),
            pcptsdScore: toNumber(formData.pcptsdScore),
            c_ssrsScore: toNumber(formData.c_ssrsScore),
            riskAssessment: formData.riskAssessment || undefined,
            suicidalIdeation: formData.suicidalIdeation,
            suicidalPlan: formData.suicidalPlan,
            suicidalIntent: formData.suicidalIntent,
            homicidalIdeation: formData.homicidalIdeation,
            selfHarmBehaviors: formData.selfHarmBehaviors,
            diagnosisPrimary: formData.diagnosisPrimary || undefined,
            diagnosisSecondary: formData.diagnosisSecondary || undefined,
            diagnosisCodes: formData.diagnosisCodes || undefined,
            formulation: formData.formulation || undefined,
            plan: formData.plan || undefined,
            medicationsStarted: formData.medicationsStarted || undefined,
            psychotherapyRecommended: formData.psychotherapyRecommended,
            therapyType: formData.therapyType || undefined,
            followUpInterval: formData.followUpInterval || undefined,
            urgentFollowUp: formData.urgentFollowUp,
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Assessment' : 'New Assessment'}
                    </h1>
                    <p className="text-gray-500 mt-1">Capture psychiatric evaluation details.</p>
                </div>
                <Link to="/psychiatry">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Assessments
                    </Button>
                </Link>
            </div>

            <PsychiatryNav />

            <Card>
                <CardHeader>
                    <CardTitle>Assessment Details</CardTitle>
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
                                label="Assessment Date"
                                type="datetime-local"
                                value={formData.assessmentDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, assessmentDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.assessmentType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, assessmentType: e.target.value as AssessmentType }))}
                                >
                                    {assessmentTypeOptions.map((option) => (
                                        <option key={option} value={option}>{assessmentTypeLabels[option]}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint & History</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Chief Complaint"
                                    value={formData.chiefComplaint}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, chiefComplaint: e.target.value }))}
                                    placeholder="Patient's main concern"
                                    required
                                />
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <Input
                                        label="History of Present Illness"
                                        value={formData.historyOfPresentIllness}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, historyOfPresentIllness: e.target.value }))}
                                        placeholder="Detailed history"
                                    />
                                    <Input
                                        label="Past Psychiatric History"
                                        value={formData.pastPsychiatricHistory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, pastPsychiatricHistory: e.target.value }))}
                                        placeholder="Previous psychiatric treatment"
                                    />
                                    <Input
                                        label="Past Medical History"
                                        value={formData.pastMedicalHistory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, pastMedicalHistory: e.target.value }))}
                                        placeholder="Medical conditions"
                                    />
                                    <Input
                                        label="Family History"
                                        value={formData.familyHistory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, familyHistory: e.target.value }))}
                                        placeholder="Family psychiatric history"
                                    />
                                    <Input
                                        label="Social History"
                                        value={formData.socialHistory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, socialHistory: e.target.value }))}
                                        placeholder="Living situation, support system"
                                    />
                                    <Input
                                        label="Substance Use History"
                                        value={formData.substanceUseHistory}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, substanceUseHistory: e.target.value }))}
                                        placeholder="Alcohol, drugs, tobacco"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mental Status Examination</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Input
                                    label="Appearance"
                                    value={formData.appearance}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, appearance: e.target.value }))}
                                    placeholder="Grooming, eye contact"
                                />
                                <Input
                                    label="Behavior"
                                    value={formData.behavior}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, behavior: e.target.value }))}
                                    placeholder="Psychomotor activity"
                                />
                                <Input
                                    label="Speech"
                                    value={formData.speech}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, speech: e.target.value }))}
                                    placeholder="Rate, volume, articulation"
                                />
                                <Input
                                    label="Mood"
                                    value={formData.mood}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mood: e.target.value }))}
                                    placeholder="Patient's subjective report"
                                />
                                <Input
                                    label="Affect"
                                    value={formData.affect}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, affect: e.target.value }))}
                                    placeholder="Observed emotional expression"
                                />
                                <Input
                                    label="Thought Process"
                                    value={formData.thoughtProcess}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, thoughtProcess: e.target.value }))}
                                    placeholder="Linear, circumstantial, tangential"
                                />
                                <Input
                                    label="Thought Content"
                                    value={formData.thoughtContent}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, thoughtContent: e.target.value }))}
                                    placeholder="Delusions, preoccupations"
                                />
                                <Input
                                    label="Perceptions"
                                    value={formData.perceptions}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, perceptions: e.target.value }))}
                                    placeholder="Hallucinations, illusions"
                                />
                                <Input
                                    label="Cognition"
                                    value={formData.cognition}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, cognition: e.target.value }))}
                                    placeholder="Orientation, memory, concentration"
                                />
                                <Input
                                    label="Insight"
                                    value={formData.insight}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, insight: e.target.value }))}
                                    placeholder="Awareness of illness"
                                />
                                <Input
                                    label="Judgment"
                                    value={formData.judgment}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, judgment: e.target.value }))}
                                    placeholder="Decision-making ability"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Scales</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                <Input
                                    label="PHQ-9 Score"
                                    type="number"
                                    min="0"
                                    max="27"
                                    value={formData.phq9Score}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, phq9Score: e.target.value }))}
                                    placeholder="0-27"
                                />
                                <Input
                                    label="GAD-7 Score"
                                    type="number"
                                    min="0"
                                    max="21"
                                    value={formData.gad7Score}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, gad7Score: e.target.value }))}
                                    placeholder="0-21"
                                />
                                <Input
                                    label="MDQ Score"
                                    type="number"
                                    value={formData.mdqScore}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, mdqScore: e.target.value }))}
                                    placeholder="Mood Disorder Questionnaire"
                                />
                                <Input
                                    label="PC-PTSD Score"
                                    type="number"
                                    value={formData.pcptsdScore}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, pcptsdScore: e.target.value }))}
                                    placeholder="0-4"
                                />
                                <Input
                                    label="C-SSRS Score"
                                    type="number"
                                    value={formData.c_ssrsScore}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, c_ssrsScore: e.target.value }))}
                                    placeholder="Suicide screening"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Assessment</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Risk Assessment Summary"
                                    value={formData.riskAssessment}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, riskAssessment: e.target.value }))}
                                    placeholder="Overall risk evaluation"
                                />
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.suicidalIdeation}
                                            onChange={(e) => setFormData(prev => ({ ...prev, suicidalIdeation: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Suicidal Ideation</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.suicidalPlan}
                                            onChange={(e) => setFormData(prev => ({ ...prev, suicidalPlan: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Suicidal Plan</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.suicidalIntent}
                                            onChange={(e) => setFormData(prev => ({ ...prev, suicidalIntent: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Suicidal Intent</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.homicidalIdeation}
                                            onChange={(e) => setFormData(prev => ({ ...prev, homicidalIdeation: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Homicidal Ideation</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.selfHarmBehaviors}
                                            onChange={(e) => setFormData(prev => ({ ...prev, selfHarmBehaviors: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Self-Harm Behaviors</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Diagnosis & Plan</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Primary Diagnosis"
                                    value={formData.diagnosisPrimary}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, diagnosisPrimary: e.target.value }))}
                                    placeholder="Primary psychiatric diagnosis"
                                />
                                <Input
                                    label="Secondary Diagnosis"
                                    value={formData.diagnosisSecondary}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, diagnosisSecondary: e.target.value }))}
                                    placeholder="Secondary diagnoses"
                                />
                                <Input
                                    label="Diagnosis Codes (ICD-10)"
                                    value={formData.diagnosisCodes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, diagnosisCodes: e.target.value }))}
                                    placeholder="e.g., F32.9, F41.1"
                                />
                                <Input
                                    label="Formulation"
                                    value={formData.formulation}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, formulation: e.target.value }))}
                                    placeholder="Case formulation"
                                />
                                <Input
                                    label="Plan"
                                    value={formData.plan}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, plan: e.target.value }))}
                                    placeholder="Treatment plan"
                                />
                                <Input
                                    label="Medications Started/Adjusted"
                                    value={formData.medicationsStarted}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, medicationsStarted: e.target.value }))}
                                    placeholder="New medications or changes"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow-up</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.psychotherapyRecommended}
                                        onChange={(e) => setFormData(prev => ({ ...prev, psychotherapyRecommended: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Psychotherapy Recommended</span>
                                </label>
                                <Input
                                    label="Therapy Type"
                                    value={formData.therapyType}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, therapyType: e.target.value }))}
                                    placeholder="e.g., CBT, DBT"
                                />
                                <Input
                                    label="Follow-up Interval"
                                    value={formData.followUpInterval}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, followUpInterval: e.target.value }))}
                                    placeholder="e.g., 2 weeks, 1 month"
                                />
                                <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.urgentFollowUp}
                                        onChange={(e) => setFormData(prev => ({ ...prev, urgentFollowUp: e.target.checked }))}
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">Urgent Follow-up Required</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <Input
                                label="Additional Notes"
                                value={formData.notes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                                placeholder="Any additional information"
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                <Save size={18} className="mr-2" />
                                {isEditMode ? 'Update Assessment' : 'Create Assessment'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
