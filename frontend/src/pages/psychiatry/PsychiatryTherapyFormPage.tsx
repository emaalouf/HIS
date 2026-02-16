import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { psychiatryTherapyService } from '../../services/psychiatry-therapy.service';
import { providerService } from '../../services/provider.service';
import { patientService } from '../../services/patient.service';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SearchableSelect } from '../../components/ui';
import { ArrowLeft, Save } from 'lucide-react';
import type { TherapyType, CreatePsychiatryTherapyRequest } from '../../types';
import type { SelectOption } from '../../components/ui/SearchableSelect';
import { PsychiatryNav } from './PsychiatryNav';

const therapyTypeOptions: TherapyType[] = [
    'INDIVIDUAL',
    'GROUP',
    'FAMILY',
    'COUPLES',
    'COGNITIVE_BEHAVIORAL',
    'DIALECTICAL_BEHAVIORAL',
    'PSYCHODYNAMIC',
    'SUPPORTIVE',
    'EXPOSURE',
];

const therapyTypeLabels: Record<TherapyType, string> = {
    INDIVIDUAL: 'Individual',
    GROUP: 'Group',
    FAMILY: 'Family',
    COUPLES: 'Couples',
    COGNITIVE_BEHAVIORAL: 'Cognitive Behavioral (CBT)',
    DIALECTICAL_BEHAVIORAL: 'Dialectical Behavioral (DBT)',
    PSYCHODYNAMIC: 'Psychodynamic',
    SUPPORTIVE: 'Supportive',
    EXPOSURE: 'Exposure Therapy',
};

const formatDateTimeLocal = (value: Date) => {
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};

type TherapyFormState = {
    patientId: string;
    providerId: string;
    sessionDate: string;
    therapyType: TherapyType;
    sessionNumber: string;
    durationMinutes: string;
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
    interventionsUsed: string;
    homeworkAssigned: string;
    progressNotes: string;
    moodRating: string;
    anxietyRating: string;
    functioningLevel: string;
    goalsDiscussed: string;
    barriersIdentified: string;
    copingStrategies: string;
    crisisPlanReviewed: boolean;
    medicationAdherence: string;
    sideEffectsDiscussed: boolean;
    patientEngagement: string;
    nextSessionDate: string;
    noShow: boolean;
    cancellationReason: string;
    urgentIssues: string;
    safetyPlanUpdated: boolean;
    notes: string;
};

export function PsychiatryTherapyFormPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState('');
    const isEditMode = Boolean(id);
    const [patientInput, setPatientInput] = useState('');
    const [providerInput, setProviderInput] = useState('');

    const defaultSessionDate = useMemo(() => formatDateTimeLocal(new Date()), []);

    const [formData, setFormData] = useState<TherapyFormState>({
        patientId: '',
        providerId: '',
        sessionDate: defaultSessionDate,
        therapyType: 'INDIVIDUAL',
        sessionNumber: '1',
        durationMinutes: '50',
        subjective: '',
        objective: '',
        assessment: '',
        plan: '',
        interventionsUsed: '',
        homeworkAssigned: '',
        progressNotes: '',
        moodRating: '',
        anxietyRating: '',
        functioningLevel: '',
        goalsDiscussed: '',
        barriersIdentified: '',
        copingStrategies: '',
        crisisPlanReviewed: false,
        medicationAdherence: '',
        sideEffectsDiscussed: false,
        patientEngagement: '',
        nextSessionDate: '',
        noShow: false,
        cancellationReason: '',
        urgentIssues: '',
        safetyPlanUpdated: false,
        notes: '',
    });

    const { data: therapy, isLoading } = useQuery({
        queryKey: ['psychiatry-therapy', id],
        queryFn: () => psychiatryTherapyService.getTherapy(id!),
        enabled: isEditMode,
    });

    const patientSearch = patientInput.trim();
    const providerSearch = providerInput.trim();

    const { data: patientsData, isLoading: isPatientsLoading } = useQuery({
        queryKey: ['patients', 'psychiatry-therapy-picker', patientSearch],
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
        queryKey: ['providers', 'psychiatry-therapy-picker', providerSearch],
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
        if (!therapy) return;
        setFormData({
            patientId: therapy.patientId,
            providerId: therapy.providerId,
            sessionDate: formatDateTimeLocal(new Date(therapy.sessionDate)),
            therapyType: therapy.therapyType,
            sessionNumber: therapy.sessionNumber.toString(),
            durationMinutes: therapy.durationMinutes?.toString() || '',
            subjective: therapy.subjective || '',
            objective: therapy.objective || '',
            assessment: therapy.assessment || '',
            plan: therapy.plan || '',
            interventionsUsed: therapy.interventionsUsed || '',
            homeworkAssigned: therapy.homeworkAssigned || '',
            progressNotes: therapy.progressNotes || '',
            moodRating: therapy.moodRating?.toString() || '',
            anxietyRating: therapy.anxietyRating?.toString() || '',
            functioningLevel: therapy.functioningLevel || '',
            goalsDiscussed: therapy.goalsDiscussed || '',
            barriersIdentified: therapy.barriersIdentified || '',
            copingStrategies: therapy.copingStrategies || '',
            crisisPlanReviewed: therapy.crisisPlanReviewed || false,
            medicationAdherence: therapy.medicationAdherence || '',
            sideEffectsDiscussed: therapy.sideEffectsDiscussed || false,
            patientEngagement: therapy.patientEngagement || '',
            nextSessionDate: therapy.nextSessionDate ? formatDateTimeLocal(new Date(therapy.nextSessionDate)) : '',
            noShow: therapy.noShow || false,
            cancellationReason: therapy.cancellationReason || '',
            urgentIssues: therapy.urgentIssues || '',
            safetyPlanUpdated: therapy.safetyPlanUpdated || false,
            notes: therapy.notes || '',
        });
        if (therapy.patient) {
            setPatientInput(`${therapy.patient.firstName} ${therapy.patient.lastName}`);
        } else {
            setPatientInput(therapy.patientId);
        }
        if (therapy.provider) {
            const prefix = therapy.provider.role === 'DOCTOR' ? 'Dr. ' : '';
            setProviderInput(`${prefix}${therapy.provider.firstName} ${therapy.provider.lastName}`);
        } else if (therapy.providerId) {
            setProviderInput(therapy.providerId);
        }
    }, [therapy]);

    const createMutation = useMutation({
        mutationFn: (payload: CreatePsychiatryTherapyRequest) => psychiatryTherapyService.createTherapy(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-therapy'] });
            navigate('/psychiatry/therapy');
        },
        onError: (err: Error) => {
            setError(err.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: CreatePsychiatryTherapyRequest) => psychiatryTherapyService.updateTherapy(id!, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['psychiatry-therapy'] });
            queryClient.invalidateQueries({ queryKey: ['psychiatry-therapy', id] });
            navigate('/psychiatry/therapy');
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

        const sessionNum = toNumber(formData.sessionNumber);
        if (sessionNum === undefined || sessionNum < 1) {
            setError('Session number must be at least 1.');
            return;
        }

        const payload: CreatePsychiatryTherapyRequest = {
            patientId: formData.patientId,
            providerId: formData.providerId,
            sessionDate: formData.sessionDate,
            therapyType: formData.therapyType,
            sessionNumber: sessionNum,
            durationMinutes: toNumber(formData.durationMinutes),
            subjective: formData.subjective || undefined,
            objective: formData.objective || undefined,
            assessment: formData.assessment || undefined,
            plan: formData.plan || undefined,
            interventionsUsed: formData.interventionsUsed || undefined,
            homeworkAssigned: formData.homeworkAssigned || undefined,
            progressNotes: formData.progressNotes || undefined,
            moodRating: toNumber(formData.moodRating),
            anxietyRating: toNumber(formData.anxietyRating),
            functioningLevel: formData.functioningLevel || undefined,
            goalsDiscussed: formData.goalsDiscussed || undefined,
            barriersIdentified: formData.barriersIdentified || undefined,
            copingStrategies: formData.copingStrategies || undefined,
            crisisPlanReviewed: formData.crisisPlanReviewed,
            medicationAdherence: formData.medicationAdherence || undefined,
            sideEffectsDiscussed: formData.sideEffectsDiscussed,
            patientEngagement: formData.patientEngagement || undefined,
            nextSessionDate: formData.nextSessionDate || undefined,
            noShow: formData.noShow,
            cancellationReason: formData.cancellationReason || undefined,
            urgentIssues: formData.urgentIssues || undefined,
            safetyPlanUpdated: formData.safetyPlanUpdated,
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
                        {isEditMode ? 'Edit Therapy Session' : 'New Therapy Session'}
                    </h1>
                    <p className="text-gray-500 mt-1">Document therapy session details and progress.</p>
                </div>
                <Link to="/psychiatry/therapy">
                    <Button variant="outline">
                        <ArrowLeft size={18} className="mr-2" />
                        Back to Therapy
                    </Button>
                </Link>
            </div>

            <PsychiatryNav />

            <Card>
                <CardHeader>
                    <CardTitle>Session Details</CardTitle>
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
                                label="Therapist"
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
                                label="Session Date"
                                type="datetime-local"
                                value={formData.sessionDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sessionDate: e.target.value }))}
                                required
                            />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Therapy Type</label>
                                <select
                                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                                    value={formData.therapyType}
                                    onChange={(e) => setFormData(prev => ({ ...prev, therapyType: e.target.value as TherapyType }))}
                                >
                                    {therapyTypeOptions.map((option) => (
                                        <option key={option} value={option}>{therapyTypeLabels[option]}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                label="Session Number"
                                type="number"
                                min="1"
                                value={formData.sessionNumber}
                                onChange={(e) => setFormData((prev) => ({ ...prev, sessionNumber: e.target.value }))}
                                required
                            />
                            <Input
                                label="Duration (minutes)"
                                type="number"
                                value={formData.durationMinutes}
                                onChange={(e) => setFormData((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                                placeholder="e.g., 50"
                            />
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">SOAP Notes</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <Input
                                    label="Subjective"
                                    value={formData.subjective}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, subjective: e.target.value }))}
                                    placeholder="Patient's report of symptoms and concerns"
                                />
                                <Input
                                    label="Objective"
                                    value={formData.objective}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, objective: e.target.value }))}
                                    placeholder="Observable behaviors and presentation"
                                />
                                <Input
                                    label="Assessment"
                                    value={formData.assessment}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, assessment: e.target.value }))}
                                    placeholder="Clinical assessment of progress and functioning"
                                />
                                <Input
                                    label="Plan"
                                    value={formData.plan}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, plan: e.target.value }))}
                                    placeholder="Treatment plan and next steps"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Content</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Interventions Used"
                                    value={formData.interventionsUsed}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, interventionsUsed: e.target.value }))}
                                    placeholder="Therapeutic techniques applied"
                                />
                                <Input
                                    label="Homework Assigned"
                                    value={formData.homeworkAssigned}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, homeworkAssigned: e.target.value }))}
                                    placeholder="Tasks for patient to complete"
                                />
                                <Input
                                    label="Progress Notes"
                                    value={formData.progressNotes}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, progressNotes: e.target.value }))}
                                    placeholder="Notes on patient progress"
                                />
                                <Input
                                    label="Goals Discussed"
                                    value={formData.goalsDiscussed}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, goalsDiscussed: e.target.value }))}
                                    placeholder="Treatment goals addressed"
                                />
                                <Input
                                    label="Barriers Identified"
                                    value={formData.barriersIdentified}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, barriersIdentified: e.target.value }))}
                                    placeholder="Obstacles to treatment progress"
                                />
                                <Input
                                    label="Coping Strategies"
                                    value={formData.copingStrategies}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, copingStrategies: e.target.value }))}
                                    placeholder="Skills taught or reviewed"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clinical Ratings</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <Input
                                    label="Mood Rating (1-10)"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.moodRating}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, moodRating: e.target.value }))}
                                    placeholder="1 = very low, 10 = excellent"
                                />
                                <Input
                                    label="Anxiety Rating (1-10)"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={formData.anxietyRating}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, anxietyRating: e.target.value }))}
                                    placeholder="1 = none, 10 = severe"
                                />
                                <Input
                                    label="Functioning Level"
                                    value={formData.functioningLevel}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, functioningLevel: e.target.value }))}
                                    placeholder="e.g., mild impairment"
                                />
                                <Input
                                    label="Patient Engagement"
                                    value={formData.patientEngagement}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, patientEngagement: e.target.value }))}
                                    placeholder="e.g., good, fair, poor"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Medication & Safety</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Medication Adherence"
                                    value={formData.medicationAdherence}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, medicationAdherence: e.target.value }))}
                                    placeholder="e.g., good, partial, non-adherent"
                                />
                                <Input
                                    label="Urgent Issues"
                                    value={formData.urgentIssues}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, urgentIssues: e.target.value }))}
                                    placeholder="Any urgent concerns"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.crisisPlanReviewed}
                                            onChange={(e) => setFormData(prev => ({ ...prev, crisisPlanReviewed: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Crisis Plan Reviewed</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.sideEffectsDiscussed}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sideEffectsDiscussed: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Side Effects Discussed</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.safetyPlanUpdated}
                                            onChange={(e) => setFormData(prev => ({ ...prev, safetyPlanUpdated: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">Safety Plan Updated</span>
                                    </label>
                                    <label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.noShow}
                                            onChange={(e) => setFormData(prev => ({ ...prev, noShow: e.target.checked }))}
                                            className="rounded border-gray-300"
                                        />
                                        <span className="text-sm">No Show</span>
                                    </label>
                                </div>
                                {formData.noShow && (
                                    <Input
                                        label="Cancellation Reason"
                                        value={formData.cancellationReason}
                                        onChange={(e) => setFormData((prev) => ({ ...prev, cancellationReason: e.target.value }))}
                                        placeholder="Reason for no show"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Input
                                label="Next Session Date"
                                type="datetime-local"
                                value={formData.nextSessionDate}
                                onChange={(e) => setFormData((prev) => ({ ...prev, nextSessionDate: e.target.value }))}
                            />
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
                                {isEditMode ? 'Update Session' : 'Create Session'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
